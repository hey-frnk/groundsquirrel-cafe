#!/usr/bin/env node
/**
 * Creates the Stripe coupon for the sale in content/sale.json.
 *
 *   export STRIPE_SECRET_KEY=sk_live_...
 *   node scripts/setup-sale.mjs --dry-run   # look first
 *   node scripts/setup-sale.mjs
 *
 * Needs the scripts' key, not the Worker's: the Worker's restricted key may
 * only use coupons, not create them.
 *
 * The coupon gets the id from sale.json, takes percentOff off the items (never
 * shipping) and has redeem_by set to the end of the sale, so Stripe itself
 * refuses it afterwards. Running it again is harmless: an existing coupon with
 * that id is checked and left alone.
 */

import fs from "node:fs";
import path from "node:path";

const API = "https://api.stripe.com/v1";
const sale = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "sale.json"), "utf8"));
const DRY_RUN = process.argv.includes("--dry-run");
const KEY = process.env.STRIPE_SECRET_KEY;

if (!KEY || !/^sk_(test|live)_/.test(KEY)) {
  console.error("\n  Set STRIPE_SECRET_KEY to a secret key (sk_test_… / sk_live_…) first.\n");
  process.exit(1);
}

const ends = Date.parse(sale.ends);
if (!(sale.percentOff > 0) || Number.isNaN(ends) || !sale.coupon) {
  console.error("\n  content/sale.json has no sale to set up (percentOff, ends, coupon).\n");
  process.exit(1);
}
if (ends <= Date.now()) {
  console.error(`\n  The sale already ended (${sale.ends}).\n`);
  process.exit(1);
}

async function stripe(method, endpoint, params) {
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const body = await response.json();
  return { status: response.status, body };
}

const mode = KEY.startsWith("sk_live_") ? "LIVE" : "TEST";
const name = `${sale.name} ${sale.percentOff}%`;
console.log(`\n  ${mode}: coupon "${sale.coupon}", ${name}, until ${sale.ends}`);

const existing = await stripe("GET", `/coupons/${encodeURIComponent(sale.coupon)}`);
if (existing.status === 200) {
  const c = existing.body;
  const matches = c.percent_off === sale.percentOff && c.redeem_by === Math.floor(ends / 1000);
  console.log(
    matches
      ? "  Already exists and matches. Nothing to do.\n"
      : `  Already exists but differs (percent_off ${c.percent_off}, redeem_by ${c.redeem_by}).\n` +
          "  Coupons cannot be edited: give the sale a new coupon id in content/sale.json.\n"
  );
  process.exit(matches ? 0 : 1);
}
if (existing.status !== 404) {
  console.error(`  Stripe: ${existing.body?.error?.message ?? existing.status}\n`);
  process.exit(1);
}

if (DRY_RUN) {
  console.log("  Would create it (dry run).\n");
  process.exit(0);
}

const created = await stripe("POST", "/coupons", {
  id: sale.coupon,
  name,
  percent_off: String(sale.percentOff),
  duration: "once",
  redeem_by: String(Math.floor(ends / 1000)),
});
if (created.status !== 200) {
  console.error(`  Stripe: ${created.body?.error?.message ?? created.status}\n`);
  process.exit(1);
}
console.log("  Created.\n");
