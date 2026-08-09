/**
 * Checkout worker for The Ground Squirrel Café.
 *
 * The website is a static export on GitHub Pages and therefore has no server of
 * its own. This Worker is the one piece that must run server-side, because
 * creating a Stripe Checkout Session requires the secret key — which must never
 * reach the browser.
 *
 * Two things are deliberately decided here rather than in the browser:
 *
 *   Price. The browser sends only Stripe Price IDs and quantities; Stripe looks
 *   up the amount from those IDs. A basket edited in devtools cannot set its
 *   own price.
 *
 *   Shipping. The rate is computed from PRICE_PROFILES and SHIPPING_TABLE, both
 *   configured here, never from anything the browser claims. Stripe Checkout
 *   shows every shipping option a session carries regardless of the delivery
 *   address, so exactly one rate is passed and the address form is locked to
 *   the country it was calculated for.
 *
 * Secrets (set with `wrangler secret put`, never committed):
 *   STRIPE_SECRET_KEY   sk_live_… / sk_test_…
 * Vars (written by scripts/sync-worker-config.mjs):
 *   SHIPPING_TABLE      profiles, rates and the Europe country list
 *   PRICE_PROFILES      Stripe Price ID → shipping profile name
 */

const MAX_ITEMS = 20;
const MAX_QUANTITY = 25;

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

/** Accepts only a Stripe Price ID and a sane quantity; anything else is rejected. */
function parseItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) return null;
  const items = [];
  for (const item of raw) {
    const price = item?.price;
    const quantity = Number(item?.quantity);
    if (typeof price !== "string" || !/^price_[A-Za-z0-9]+$/.test(price)) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null;
    items.push({ price, quantity });
  }
  return items;
}

/** The rate for one profile in one country, or null if that profile has none. */
export function rateFor(profile, country, europe) {
  const rates = profile?.rates;
  if (!rates) return null;
  if (typeof rates[country] === "number") return rates[country];
  if (europe.includes(country) && typeof rates._EUROPE === "number") return rates._EUROPE;
  if (typeof rates._WORLD === "number") return rates._WORLD;
  return null;
}

/**
 * Highest applicable rate across everything in the basket. An order ships as
 * one parcel, so charging the sum would overcharge; charging the highest covers
 * the most expensive thing in it.
 *
 * Returns null when any item has no known profile — better to refuse the
 * checkout than to guess a shipping price and eat the difference.
 */
export function shippingFor(items, country, table, priceProfiles) {
  const europe = table.europe ?? [];
  let best = null;

  for (const item of items) {
    const profileName = priceProfiles[item.price];
    if (!profileName) return null;
    const profile = table.profiles?.[profileName];
    if (!profile) return null;

    const amount = rateFor(profile, country, europe);
    if (amount === null) return null;
    if (!best || amount > best.amount) best = { amount, profile };
  }

  return best;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, env);
    }
    // Browsers send Origin on cross-origin POSTs; reject anything that is not
    // our own site so the endpoint cannot be driven from elsewhere.
    if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) {
      return json({ error: "Forbidden" }, 403, env);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, env);
    }

    const items = parseItems(payload?.items);
    if (!items) return json({ error: "Invalid basket" }, 400, env);

    const country = payload?.country;
    if (typeof country !== "string" || !/^[A-Z]{2}$/.test(country)) {
      return json({ error: "Invalid country" }, 400, env);
    }

    let table;
    let priceProfiles;
    try {
      table = JSON.parse(env.SHIPPING_TABLE || "{}");
      priceProfiles = JSON.parse(env.PRICE_PROFILES || "{}");
    } catch {
      console.error("SHIPPING_TABLE or PRICE_PROFILES is not valid JSON");
      return json({ error: "Could not start checkout" }, 500, env);
    }

    const shipping = shippingFor(items, country, table, priceProfiles);
    if (!shipping) {
      console.error("No shipping rate for", { country, items });
      return json({ error: "We cannot ship this order to that country yet" }, 400, env);
    }

    const currency = table.currency ?? "chf";
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", env.CANCEL_URL);
    form.set("billing_address_collection", "required");
    form.set("automatic_tax[enabled]", "true");

    items.forEach((item, i) => {
      form.set(`line_items[${i}][price]`, item.price);
      form.set(`line_items[${i}][quantity]`, String(item.quantity));
      form.set(`line_items[${i}][adjustable_quantity][enabled]`, "true");
      form.set(`line_items[${i}][adjustable_quantity][minimum]`, "0");
      form.set(`line_items[${i}][adjustable_quantity][maximum]`, String(MAX_QUANTITY));
    });

    form.set("shipping_address_collection[allowed_countries][0]", country);

    // Created inline rather than referenced by ID: the rate depends on both the
    // destination and what is in the basket, which would otherwise mean
    // registering a rate in Stripe for every profile/country combination.
    const rate = "shipping_options[0][shipping_rate_data]";
    form.set(`${rate}[type]`, "fixed_amount");
    form.set(`${rate}[fixed_amount][amount]`, String(Math.round(shipping.amount * 100)));
    form.set(`${rate}[fixed_amount][currency]`, currency);
    form.set(`${rate}[display_name]`, shipping.profile.label ?? "Shipping");
    if (table.taxBehavior) form.set(`${rate}[tax_behavior]`, table.taxBehavior);
    if (table.taxCode) form.set(`${rate}[tax_code]`, table.taxCode);
    if (shipping.profile.minDays) {
      form.set(`${rate}[delivery_estimate][minimum][unit]`, "business_day");
      form.set(`${rate}[delivery_estimate][minimum][value]`, String(shipping.profile.minDays));
    }
    if (shipping.profile.maxDays) {
      form.set(`${rate}[delivery_estimate][maximum][unit]`, "business_day");
      form.set(`${rate}[delivery_estimate][maximum][value]`, String(shipping.profile.maxDays));
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });

    const session = await response.json();
    if (!response.ok) {
      // Stripe's message can name internal configuration, so log it for us and
      // give the customer something generic.
      console.error("Stripe error", session?.error);
      return json({ error: "Could not start checkout" }, 502, env);
    }

    return json({ url: session.url }, 200, env);
  },
};
