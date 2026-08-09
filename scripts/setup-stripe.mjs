#!/usr/bin/env node
/**
 * Creates one Stripe Product + Price per shop variant, straight from the
 * content files, then writes the resulting Price IDs back into them.
 *
 * The secret key is read from the environment and never passed as an argument,
 * so it stays out of your shell history:
 *
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   node scripts/setup-stripe.mjs
 *
 * Safe to run repeatedly. Products use a deterministic ID derived from the SKU
 * and prices use the SKU as their lookup_key, so a second run reuses what is
 * already there instead of creating duplicates. If a price changed, a new one
 * is created (Stripe prices are immutable) and the old one is archived.
 *
 * Test and live mode are separate worlds: prices created with sk_test_ do not
 * exist in live mode. Run once with the test key to try checkout, then again
 * with the live key before going public.
 *
 * Flags:
 *   --dry-run     show what would happen, change nothing
 *   --no-images   skip product images (use if the site is not deployed yet)
 *   --no-write    create in Stripe but leave the content files alone
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const API = "https://api.stripe.com/v1";
const CURRENCY = "chf";
const SITE = "https://thegroundsquirrel.cafe";
const SHOP_DIR = path.join(process.cwd(), "content", "shop");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const WITH_IMAGES = !args.has("--no-images");
const WRITE_BACK = !args.has("--no-write");

const KEY = process.env.STRIPE_SECRET_KEY;

if (!KEY) {
  console.error(
    "\n  STRIPE_SECRET_KEY is not set.\n\n" +
      "  Create a fresh key at Dashboard → Developers → API keys, then:\n" +
      "    export STRIPE_SECRET_KEY=sk_test_...\n" +
      "    node scripts/setup-stripe.mjs\n"
  );
  process.exit(1);
}
if (!/^sk_(test|live)_/.test(KEY)) {
  console.error("\n  That does not look like a Stripe secret key (sk_test_… / sk_live_…).\n");
  process.exit(1);
}

const MODE = KEY.startsWith("sk_live_") ? "LIVE" : "TEST";

/* -------------------------------------------------------------------------- */

async function stripe(method, endpoint, params) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  if (params) options.body = new URLSearchParams(params);

  const response = await fetch(`${API}${endpoint}`, options);
  const body = await response.json();
  if (!response.ok) {
    const err = new Error(body?.error?.message ?? `HTTP ${response.status}`);
    err.code = body?.error?.code;
    err.status = response.status;
    throw err;
  }
  return body;
}

/** Stripe object IDs allow [a-zA-Z0-9_-]; SKUs already fit once lowercased. */
const productIdFor = (sku) => sku.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

async function ensureProduct({ id, name, description, images }) {
  try {
    const existing = await stripe("GET", `/products/${id}`);
    const params = { name, description: description ?? "" };
    if (WITH_IMAGES) images.forEach((url, i) => (params[`images[${i}]`] = url));
    await stripe("POST", `/products/${id}`, params);
    return { product: existing, created: false };
  } catch (e) {
    if (e.status !== 404) throw e;
  }

  const params = { id, name, description: description ?? "", shippable: "true" };
  if (WITH_IMAGES) images.forEach((url, i) => (params[`images[${i}]`] = url));
  const product = await stripe("POST", "/products", params);
  return { product, created: true };
}

async function ensurePrice({ productId, sku, amountMinor }) {
  const { data } = await stripe(
    "GET",
    `/prices?lookup_keys[0]=${encodeURIComponent(sku)}&active=true&limit=1`
  );
  const existing = data[0];

  if (existing) {
    if (existing.unit_amount === amountMinor && existing.currency === CURRENCY) {
      return { price: existing, action: "reused" };
    }
    // Amounts are immutable, so the new price takes over the lookup key and
    // the stale one is retired.
    const price = await stripe("POST", "/prices", {
      product: productId,
      currency: CURRENCY,
      unit_amount: String(amountMinor),
      lookup_key: sku,
      transfer_lookup_key: "true",
    });
    await stripe("POST", `/prices/${existing.id}`, { active: "false" });
    return { price, action: "repriced" };
  }

  const price = await stripe("POST", "/prices", {
    product: productId,
    currency: CURRENCY,
    unit_amount: String(amountMinor),
    lookup_key: sku,
  });
  return { price, action: "created" };
}

/**
 * Fills in stripePriceId for the variant carrying this SKU, touching only that
 * one value so the rest of the file keeps its formatting.
 *
 * Works on the variant's whole block rather than on adjacent lines: the keys
 * within a variant may appear in any order, and an earlier version of this
 * function assumed stripePriceId directly followed sku. It silently failed the
 * moment another key was added between them, leaving the file pointing at
 * prices that had just been archived.
 */
function patchPriceId(source, sku, priceId) {
  const quoted = sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const skuLine = new RegExp(`^([ \\t]*)sku:\\s*["']${quoted}["']\\s*$`, "m");
  const match = skuLine.exec(source);
  if (!match) return null;

  // The variant runs from its "- " bullet to the next bullet at the same indent.
  const indent = match[1];
  const bullet = new RegExp(`^${indent.slice(0, -2)}- `, "m");
  const before = source.slice(0, match.index);
  const blockStart = before.lastIndexOf(`\n${indent.slice(0, -2)}- `) + 1;
  const rest = source.slice(match.index);
  const nextBullet = bullet.exec(rest.slice(1));
  const blockEnd = nextBullet ? match.index + 1 + nextBullet.index : source.length;

  const block = source.slice(blockStart, blockEnd);
  const priceLine = /^([ \t]*)stripePriceId:[ \t]*(["'][^"']*["']|\S*)[ \t]*$/m;
  if (!priceLine.test(block)) return null;

  const patched = block.replace(priceLine, `$1stripePriceId: "${priceId}"`);
  return source.slice(0, blockStart) + patched + source.slice(blockEnd);
}

/* -------------------------------------------------------------------------- */

const files = fs.readdirSync(SHOP_DIR).filter((f) => f.endsWith(".md"));

console.log(`\n  Stripe setup — ${MODE} mode${DRY_RUN ? " (dry run)" : ""}`);
console.log(`  ${files.length} product file(s) in content/shop\n`);

let created = 0;
let reused = 0;
let repriced = 0;
const failures = [];

for (const file of files) {
  const filePath = path.join(SHOP_DIR, file);
  let source = fs.readFileSync(filePath, "utf8");
  const { data } = matter(source);
  const variants = Array.isArray(data.variants) ? data.variants : [];

  console.log(`  ${data.title}`);

  for (const variant of variants) {
    const sku = variant.sku;
    const amount = Number(variant.price);

    if (!sku) {
      failures.push(`${file}: variant "${variant.label}" has no SKU`);
      console.log(`    ⚠ ${variant.label} — no SKU, skipped`);
      continue;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      failures.push(`${file}: variant "${variant.label}" has no usable price`);
      console.log(`    ⚠ ${variant.label} — no usable price, skipped`);
      continue;
    }

    const amountMinor = Math.round(amount * 100);
    const name = `${data.title} — ${variant.label}`;
    const images = (variant.images ?? []).slice(0, 8).map((src) => `${SITE}${src}`);

    if (DRY_RUN) {
      console.log(
        `    · ${variant.label} — CHF ${amount.toFixed(2)} (${sku}) would be created`
      );
      continue;
    }

    try {
      const { product } = await ensureProduct({
        id: productIdFor(sku),
        name,
        description: variant.note ?? data.tagline,
        images,
      });
      const { price, action } = await ensurePrice({
        productId: product.id,
        sku,
        amountMinor,
      });

      if (action === "created") created++;
      else if (action === "reused") reused++;
      else repriced++;

      const marks = { created: "+", reused: "=", repriced: "~" };
      console.log(
        `    ${marks[action]} ${variant.label} — CHF ${amount.toFixed(2)}  ${price.id}`
      );

      if (WRITE_BACK) {
        const patched = patchPriceId(source, sku, price.id);
        if (patched) source = patched;
        else failures.push(`${file}: could not write price ID for ${sku} — paste it by hand`);
      }
    } catch (e) {
      failures.push(`${file}: ${variant.label} — ${e.message}`);
      console.log(`    ✗ ${variant.label} — ${e.message}`);
    }
  }

  if (WRITE_BACK && !DRY_RUN) fs.writeFileSync(filePath, source);
  console.log();
}

console.log(
  `  ${created} created, ${reused} unchanged, ${repriced} repriced` +
    (WRITE_BACK && !DRY_RUN ? ", price IDs written to content/shop" : "")
);

if (failures.length > 0) {
  console.error(`\n  ${failures.length} problem(s):`);
  failures.forEach((f) => console.error(`    - ${f}`));
  // Exit non-zero so a `setup-stripe && sync-worker-config && wrangler deploy`
  // chain stops here. A price ID that failed to reach the content file means
  // the site still names the price this run just archived, and deploying on top
  // of that publishes a shop whose checkout fails.
  console.error(
    "\n  Stopping: the site would still reference prices this run replaced.\n"
  );
  process.exit(1);
}

if (MODE === "TEST" && !DRY_RUN && created + repriced > 0) {
  console.log(
    "\n  These are TEST-mode prices. Before going live, run this again with\n" +
      "  the live key and commit the live IDs.\n"
  );
}

console.log(
  "\n  Next, so the Worker knows what postage each price attracts:\n" +
    "    node scripts/sync-worker-config.mjs\n" +
    "    cd checkout-worker && npx wrangler deploy\n"
);
