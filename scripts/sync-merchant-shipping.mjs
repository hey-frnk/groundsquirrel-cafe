#!/usr/bin/env node
/**
 * Writes the shipping policies in Google Merchant Center from
 * content/shipping.json, through the Merchant API.
 *
 * The product feed (/merchant-feed.xml) puts each variant's shipping profile
 * on it as shipping_label. This script turns the rate table into Merchant
 * Center shipping services whose rate groups price those labels, so all 128
 * countries are covered and nobody has to type rates into Merchant Center.
 *
 * Countries that pay the same rates for every profile share one service, and
 * profiles with different delivery times get separate services, since a
 * service has only one delivery time. Today that is 6 country groups (CH, GB,
 * US, CA, AU, the rest of the world) times 2 delivery times = 12 services.
 *
 * The Merchant API replaces ALL shipping settings at once: whatever was set up
 * by hand in Merchant Center is gone after a sync. That is the point.
 *
 * Credentials come from the environment, never from arguments:
 *
 *   MERCHANT_ACCOUNT_ID            the number at the top of Merchant Center
 *   GOOGLE_SERVICE_ACCOUNT_KEY     the service account's JSON key, as text
 *     or GOOGLE_APPLICATION_CREDENTIALS, a path to that JSON file
 *
 *   node scripts/sync-merchant-shipping.mjs --dry-run   compare, change nothing
 *   node scripts/sync-merchant-shipping.mjs             write to Merchant Center
 *   node scripts/sync-merchant-shipping.mjs --register you@example.com
 *       one-time registration of the Google Cloud project with the Merchant
 *       API (the email is a contact person, not the service account)
 *
 * --dry-run works without credentials too; it then only prints what it would
 * send. Runs in GitHub Actions via .github/workflows/merchant-shipping.yml.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API = "https://merchantapi.googleapis.com/accounts/v1";
const SCOPE = "https://www.googleapis.com/auth/content";
const SHIPPING = path.join(process.cwd(), "content", "shipping.json");

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const registerIndex = argv.indexOf("--register");
const REGISTER_EMAIL = registerIndex >= 0 ? argv[registerIndex + 1] : undefined;

/* -------------------------------------------------------------------------- */
/* What Merchant Center should say                                            */
/* -------------------------------------------------------------------------- */

const config = JSON.parse(fs.readFileSync(SHIPPING, "utf8"));
const CURRENCY = (config.currency ?? "chf").toUpperCase();
const EUROPE = config.europe ?? [];
const HANDLING = config.handlingDays ?? { min: 1, max: 5 };
const PROFILES = config.profiles ?? {};
const SHIP_TO = config.shipTo ?? {};

/** Same lookup as rateFor() in src/lib/shipping.ts and the checkout Worker. */
function rateFor(profile, country) {
  const { rates } = profile;
  if (typeof rates[country] === "number") return rates[country];
  if (EUROPE.includes(country) && typeof rates._EUROPE === "number") return rates._EUROPE;
  if (typeof rates._WORLD === "number") return rates._WORLD;
  return null;
}

function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.values()];
}

const micros = (amount) => String(Math.round(amount * 1_000_000));

function buildServices() {
  const profileNames = Object.keys(PROFILES);
  const countries = Object.keys(SHIP_TO);

  // Profiles that share a delivery time can share a service.
  const timings = groupBy(profileNames, (name) => {
    const p = PROFILES[name];
    return `${p.minDays ?? 3}-${p.maxDays ?? 10}`;
  });
  // Countries that pay the same for everything can share a service.
  const regions = groupBy(countries, (code) =>
    JSON.stringify(profileNames.map((name) => rateFor(PROFILES[name], code)))
  );

  const services = [];
  for (const region of regions) {
    const where =
      region.length === 1 ? SHIP_TO[region[0]] : `Worldwide (${region.length} countries)`;

    for (const names of timings) {
      const { minDays = 3, maxDays = 10 } = PROFILES[names[0]];
      const priced = names.filter((name) => rateFor(PROFILES[name], region[0]) !== null);
      if (priced.length === 0) continue;

      // Profiles with the same rate share a rate group.
      const rateGroups = groupBy(priced, (name) => rateFor(PROFILES[name], region[0])).map(
        (labels) => ({
          name: labels.join(", "),
          applicableShippingLabels: labels,
          singleValue: {
            flatRate: {
              amountMicros: micros(rateFor(PROFILES[labels[0]], region[0])),
              currencyCode: CURRENCY,
            },
          },
        })
      );
      // Anything else (other labels, or none) is not sent with this service.
      // It is either priced by the service for its own delivery time, or not
      // shippable at all.
      rateGroups.push({
        name: "other labels",
        applicableShippingLabels: [],
        singleValue: { noShipping: true },
      });

      services.push({
        // Unique per account: timings are grouped by their days.
        serviceName: `${where}, ${minDays}-${maxDays} days`,
        active: true,
        deliveryCountries: [...region].sort(),
        currencyCode: CURRENCY,
        deliveryTime: {
          minHandlingDays: HANDLING.min,
          maxHandlingDays: HANDLING.max,
          minTransitDays: minDays,
          maxTransitDays: maxDays,
        },
        rateGroups,
      });
    }
  }
  return services;
}

/**
 * The parts we set, in a fixed shape, so a service read back from Google
 * (with defaults filled in and fields reordered) compares equal to ours.
 */
function canonical(services = []) {
  return JSON.stringify(
    services
      .map((s) => ({
        name: s.serviceName,
        active: Boolean(s.active),
        countries: [...(s.deliveryCountries ?? [])].sort(),
        currency: s.currencyCode,
        time: [
          s.deliveryTime?.minHandlingDays,
          s.deliveryTime?.maxHandlingDays,
          s.deliveryTime?.minTransitDays,
          s.deliveryTime?.maxTransitDays,
        ].map(Number),
        rates: (s.rateGroups ?? []).map((g) => ({
          labels: [...(g.applicableShippingLabels ?? [])].sort(),
          value: g.singleValue?.noShipping
            ? "none"
            : `${Number(g.singleValue?.flatRate?.amountMicros)} ${g.singleValue?.flatRate?.currencyCode}`,
        })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );
}

function describe(services = []) {
  for (const s of services) {
    const countries = s.deliveryCountries ?? [];
    const list = countries.length > 6 ? `${countries.length} countries` : countries.join(" ");
    console.log(`  ${s.active ? " " : "(inactive) "}${s.serviceName}  [${list}]  ${s.currencyCode}`);
    for (const g of s.rateGroups ?? []) {
      const labels = g.applicableShippingLabels?.length ? g.applicableShippingLabels.join(", ") : "everything else";
      const value = g.singleValue?.noShipping
        ? "no shipping"
        : g.singleValue?.flatRate
          ? `${Number(g.singleValue.flatRate.amountMicros) / 1e6} ${g.singleValue.flatRate.currencyCode}`
          : "(table or carrier rate)";
      console.log(`      ${labels}: ${value}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Google                                                                     */
/* -------------------------------------------------------------------------- */

function serviceAccountKey() {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (inline) return JSON.parse(inline);
  if (file) return JSON.parse(fs.readFileSync(file, "utf8"));
  return null;
}

const base64url = (input) => Buffer.from(input).toString("base64url");

/** OAuth for a service account: a signed JWT traded for an access token. */
async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = key.token_uri ?? "https://oauth2.googleapis.com/token";
  const unsigned =
    base64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    base64url(
      JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 })
    );
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), key.private_key).toString("base64url");

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Google sign-in failed: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function call(token, method, url, body) {
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, json };
}

function fail(message, detail) {
  console.error(`\n  ${message}`);
  if (detail) console.error(JSON.stringify(detail, null, 2));
  process.exit(1);
}

/* -------------------------------------------------------------------------- */

const wanted = buildServices();
const key = serviceAccountKey();
const ACCOUNT = process.env.MERCHANT_ACCOUNT_ID?.trim();

if (!key || !ACCOUNT) {
  if (!DRY_RUN) {
    fail(
      "MERCHANT_ACCOUNT_ID and GOOGLE_SERVICE_ACCOUNT_KEY (or GOOGLE_APPLICATION_CREDENTIALS)\n" +
        "  must be set. See the comment at the top of this script."
    );
  }
  console.log(`\nNo credentials, so only what would be sent (${wanted.length} services):\n`);
  describe(wanted);
  process.exit(0);
}

const token = await accessToken(key);

if (registerIndex >= 0) {
  if (!REGISTER_EMAIL || REGISTER_EMAIL.startsWith("--")) {
    fail("Usage: --register you@example.com (a person's Google account, not the service account)");
  }
  const result = await call(token, "POST", `${API}/accounts/${ACCOUNT}/developerRegistration:registerGcp`, {
    developerEmail: REGISTER_EMAIL,
  });
  if (!result.ok) fail(`Registration failed (HTTP ${result.status}):`, result.json);
  console.log("\nRegistered. The Google Cloud project can now use the Merchant API.");
  process.exit(0);
}

const SETTINGS = `${API}/accounts/${ACCOUNT}/shippingSettings`;

async function current() {
  const result = await call(token, "GET", SETTINGS);
  if (result.status === 404) return { etag: "", services: [] };
  if (!result.ok) {
    const hint =
      result.status === 401
        ? "\n  401 usually means the Google Cloud project is not registered yet: run with --register once."
        : result.status === 403
          ? "\n  403 usually means the service account is not a user (Admin) in Merchant Center."
          : "";
    fail(`Could not read the shipping settings (HTTP ${result.status}).${hint}`, result.json);
  }
  return result.json;
}

let live = await current();

if (canonical(live.services) === canonical(wanted)) {
  console.log(`\nMerchant Center already matches content/shipping.json (${wanted.length} services).`);
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\nIn Merchant Center now:\n");
  describe(live.services);
  console.log(`\nWould replace that with (${wanted.length} services):\n`);
  describe(wanted);
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Send the whole resource back: missing fields are cleared, so warehouses and
// anything else we do not manage are passed through untouched.
const { name, services, ...rest } = live;
void name;
void services;
const result = await call(token, "POST", `${API}/accounts/${ACCOUNT}/shippingSettings:insert`, {
  ...rest,
  etag: live.etag ?? "",
  services: wanted,
});
if (!result.ok) fail(`Merchant Center refused the shipping settings (HTTP ${result.status}):`, result.json);

// Reads lag behind writes: right after the insert, Google may still serve the
// old settings (and the old etag). Never insert again on that basis, the stale
// etag is refused; just read until the new settings show up.
for (let attempt = 1; attempt <= 12; attempt++) {
  live = await current();
  if (canonical(live.services) === canonical(wanted)) {
    console.log(`\nShipping policies updated: ${wanted.length} services.\n`);
    describe(live.services);
    process.exit(0);
  }
  await sleep(5000);
}

fail("Merchant Center accepted the update, but a minute later still reads back different settings:", live.services);
