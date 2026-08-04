#!/usr/bin/env node
/**
 * Creates one Stripe Shipping Rate per zone in content/shipping.json, then
 * writes the resulting shr_… IDs into checkout-worker/wrangler.toml so the
 * Worker can pick the right one per customer.
 *
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   node scripts/setup-shipping.mjs           # dry run, changes nothing
 *   node scripts/setup-shipping.mjs --apply   # create in Stripe
 *
 * Dry run is the default on purpose: a wrong shipping amount costs real money
 * on every order, so the numbers get shown before anything is created.
 *
 * Safe to re-run. Rates are tagged with metadata[gsc_zone]; an existing rate
 * for a zone is reused when the amount matches, and replaced (new rate created,
 * old one archived) when it does not — Stripe shipping rates are immutable.
 */

import fs from "node:fs";
import path from "node:path";

const API = "https://api.stripe.com/v1";
const CONFIG = path.join(process.cwd(), "content", "shipping.json");
const WRANGLER = path.join(process.cwd(), "checkout-worker", "wrangler.toml");

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const WRITE_BACK = !args.has("--no-write");

const KEY = process.env.STRIPE_SECRET_KEY;

if (!KEY) {
  console.error(
    "\n  STRIPE_SECRET_KEY is not set.\n" +
      "    export STRIPE_SECRET_KEY=sk_test_...\n"
  );
  process.exit(1);
}
if (!/^sk_(test|live)_/.test(KEY)) {
  console.error("\n  That does not look like a Stripe secret key.\n");
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
    throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
  }
  return body;
}

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const currency = (config.currency ?? "chf").toLowerCase();
const taxBehavior = config.taxBehavior ?? "exclusive";
const zones = config.zones ?? [];

if (zones.length === 0) {
  console.error("\n  No zones defined in content/shipping.json.\n");
  process.exit(1);
}

const catchAllIndex = zones.findIndex((z) => z.countries?.includes("*"));
if (catchAllIndex !== -1 && catchAllIndex !== zones.length - 1) {
  console.error(
    `\n  The catch-all zone ("${zones[catchAllIndex].id}") must be last, ` +
      "otherwise it swallows the zones below it.\n"
  );
  process.exit(1);
}

const seen = new Set();
for (const zone of zones) {
  for (const country of zone.countries ?? []) {
    if (country === "*") continue;
    if (seen.has(country)) {
      console.error(`\n  ${country} appears in more than one zone.\n`);
      process.exit(1);
    }
    seen.add(country);
  }
}

/* -------------------------------------------------------------------------- */

console.log(`\n  Shipping rates — ${MODE} mode${APPLY ? "" : " (dry run)"}\n`);

for (const zone of zones) {
  const countries =
    zone.countries?.includes("*")
      ? "everywhere else"
      : `${zone.countries.length} countries`;
  console.log(
    `    ${zone.label.padEnd(30)} ${currency.toUpperCase()} ` +
      `${zone.amount.toFixed(2).padStart(6)}   ${zone.minDays}–${zone.maxDays} days   ${countries}`
  );
}

if (!APPLY) {
  console.log(
    "\n  Nothing created — this was a dry run.\n" +
      "  Check the amounts against what dispatch actually costs you, then:\n" +
      "    node scripts/setup-shipping.mjs --apply\n"
  );
  process.exit(0);
}

/** Existing rates, keyed by the zone id we tagged them with. */
const { data: existingRates } = await stripe("GET", "/shipping_rates?limit=100&active=true");
const byZone = new Map(
  existingRates
    .filter((r) => r.metadata?.gsc_zone)
    .map((r) => [r.metadata.gsc_zone, r])
);

const resolved = [];
let created = 0;
let reused = 0;
let replaced = 0;

for (const zone of zones) {
  const amountMinor = Math.round(zone.amount * 100);
  const existing = byZone.get(zone.id);

  if (
    existing &&
    existing.fixed_amount?.amount === amountMinor &&
    existing.fixed_amount?.currency === currency
  ) {
    resolved.push({ zone, rate: existing.id });
    reused++;
    console.log(`    = ${zone.label} — unchanged  ${existing.id}`);
    continue;
  }

  const rate = await stripe("POST", "/shipping_rates", {
    display_name: zone.label,
    type: "fixed_amount",
    "fixed_amount[amount]": String(amountMinor),
    "fixed_amount[currency]": currency,
    tax_behavior: taxBehavior,
    "delivery_estimate[minimum][unit]": "business_day",
    "delivery_estimate[minimum][value]": String(zone.minDays),
    "delivery_estimate[maximum][unit]": "business_day",
    "delivery_estimate[maximum][value]": String(zone.maxDays),
    "metadata[gsc_zone]": zone.id,
  });

  if (existing) {
    await stripe("POST", `/shipping_rates/${existing.id}`, { active: "false" });
    replaced++;
    console.log(`    ~ ${zone.label} — repriced  ${rate.id}`);
  } else {
    created++;
    console.log(`    + ${zone.label} — created  ${rate.id}`);
  }

  resolved.push({ zone, rate: rate.id });
}

/* -------------------------------------------------------------------------- */

// The Worker needs both the rate ID and which countries it covers, so it can
// hand Stripe exactly one option instead of letting the customer choose.
const zonesForWorker = resolved.map(({ zone, rate }) => ({
  rate,
  countries: zone.countries,
}));
const serialised = JSON.stringify(zonesForWorker);

if (WRITE_BACK) {
  let toml = fs.readFileSync(WRANGLER, "utf8");
  const line = `SHIPPING_ZONES = '${serialised}'`;
  toml = /^SHIPPING_ZONES\s*=.*$/m.test(toml)
    ? toml.replace(/^SHIPPING_ZONES\s*=.*$/m, line)
    : `${toml.trimEnd()}\n${line}\n`;
  fs.writeFileSync(WRANGLER, toml);
  console.log("\n  SHIPPING_ZONES written to checkout-worker/wrangler.toml");
} else {
  console.log(`\n  SHIPPING_ZONES = '${serialised}'`);
}

console.log(`\n  ${created} created, ${reused} unchanged, ${replaced} repriced`);
console.log(
  "\n  Next: cd checkout-worker && npx wrangler deploy\n" +
    (MODE === "TEST"
      ? "  These are TEST-mode rates — repeat with the live key before going public.\n"
      : "")
);
