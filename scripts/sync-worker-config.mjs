#!/usr/bin/env node
/**
 * Writes the Worker's shipping configuration into checkout-worker/wrangler.toml:
 *
 *   SHIPPING_TABLE  the rates from content/shipping.json
 *   PRICE_PROFILES  Stripe Price ID → shipping profile, read off content/shop
 *
 * Both live server-side on purpose. The browser never says what postage should
 * cost; it only names the products, and the Worker prices the postage itself.
 *
 *   node scripts/sync-worker-config.mjs
 *   cd checkout-worker && npx wrangler deploy
 *
 * No Stripe key required — shipping rates are created inline per checkout, so
 * nothing has to be registered in the Stripe dashboard.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SHIPPING = path.join(process.cwd(), "content", "shipping.json");
const SHOP_DIR = path.join(process.cwd(), "content", "shop");
const WRANGLER = path.join(process.cwd(), "checkout-worker", "wrangler.toml");

const config = JSON.parse(fs.readFileSync(SHIPPING, "utf8"));
const profiles = config.profiles ?? {};
const problems = [];

// Only what the Worker actually reads — the _comment block stays out of the var.
const table = {
  currency: config.currency ?? "chf",
  taxBehavior: config.taxBehavior,
  taxCode: config.taxCode,
  europe: config.europe ?? [],
  profiles,
};

const priceProfiles = {};
let priced = 0;
let unpriced = 0;

for (const file of fs.readdirSync(SHOP_DIR).filter((f) => f.endsWith(".md"))) {
  const { data } = matter(fs.readFileSync(path.join(SHOP_DIR, file), "utf8"));
  for (const variant of data.variants ?? []) {
    const where = `${file}: ${variant.sku ?? variant.label}`;

    if (!variant.shippingProfile) {
      problems.push(`${where} — no shippingProfile`);
      continue;
    }
    if (!profiles[variant.shippingProfile]) {
      problems.push(`${where} — unknown profile "${variant.shippingProfile}"`);
      continue;
    }
    if (!variant.stripePriceId) {
      unpriced++;
      continue;
    }
    priceProfiles[variant.stripePriceId] = variant.shippingProfile;
    priced++;
  }
}

// A profile with no _WORLD entry silently refuses checkout everywhere it has no
// explicit country, which is far easier to spot here than in a Worker log.
for (const [name, profile] of Object.entries(profiles)) {
  if (typeof profile.rates?._WORLD !== "number") {
    problems.push(`profile "${name}" has no _WORLD fallback rate`);
  }
}

if (problems.length > 0) {
  console.error(`\n  ${problems.length} problem(s):`);
  problems.forEach((p) => console.error(`    - ${p}`));
  console.error("");
  process.exit(1);
}

let toml = fs.readFileSync(WRANGLER, "utf8");
for (const [key, value] of [
  ["SHIPPING_TABLE", table],
  ["PRICE_PROFILES", priceProfiles],
]) {
  const line = `${key} = '${JSON.stringify(value)}'`;
  toml = new RegExp(`^${key}\\s*=.*$`, "m").test(toml)
    ? toml.replace(new RegExp(`^${key}\\s*=.*$`, "m"), line)
    : `${toml.trimEnd()}\n${line}\n`;
}
fs.writeFileSync(WRANGLER, toml);

console.log(`\n  Profiles:      ${Object.keys(profiles).join(", ")}`);
console.log(`  Mapped prices: ${priced}`);
if (unpriced > 0) {
  console.log(`  Not yet in Stripe: ${unpriced} (run scripts/setup-stripe.mjs)`);
}
console.log("\n  Written to checkout-worker/wrangler.toml");
console.log("  Next: cd checkout-worker && npx wrangler deploy\n");
