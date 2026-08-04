/**
 * Checkout worker for The Ground Squirrel Café.
 *
 * The website is a static export on GitHub Pages and therefore has no server of
 * its own. This Worker is the one piece that must run server-side, because
 * creating a Stripe Checkout Session requires the secret key — which must never
 * reach the browser.
 *
 * Security note: the browser sends only Stripe Price IDs and quantities. Stripe
 * looks up the actual amount from those IDs, so a customer editing their basket
 * in devtools cannot set their own price.
 *
 * Secrets (set with `wrangler secret put`, never committed):
 *   STRIPE_SECRET_KEY   sk_live_... / sk_test_...
 * Vars (in wrangler.toml):
 *   ALLOWED_ORIGIN      https://thegroundsquirrel.cafe
 *   SUCCESS_URL         https://thegroundsquirrel.cafe/shop/thank-you/
 *   CANCEL_URL          https://thegroundsquirrel.cafe/shop/
 *   SHIPPING_RATES      comma-separated Stripe shipping rate IDs (shr_...)
 */

const MAX_ITEMS = 20;
const MAX_QUANTITY = 25;

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

/**
 * Accepts only what we expect: a Stripe Price ID and a sane quantity. Anything
 * else is rejected rather than forwarded to Stripe.
 */
function parseItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) {
    return null;
  }
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, env);
    }
    // The browser sends Origin on cross-origin POSTs; reject anything that is
    // not our own site so the endpoint cannot be driven from elsewhere.
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

    // Stripe's API takes form-encoded bodies with bracketed array keys.
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", env.CANCEL_URL);
    form.set("billing_address_collection", "required");
    form.set("phone_number_collection[enabled]", "false");
    form.set("automatic_tax[enabled]", "true");

    items.forEach((item, i) => {
      form.set(`line_items[${i}][price]`, item.price);
      form.set(`line_items[${i}][quantity]`, String(item.quantity));
      form.set(`line_items[${i}][adjustable_quantity][enabled]`, "true");
      form.set(`line_items[${i}][adjustable_quantity][minimum]`, "0");
      form.set(`line_items[${i}][adjustable_quantity][maximum]`, String(MAX_QUANTITY));
    });

    // Which countries we ship to, and at what price. Both are configured in
    // Stripe so they can change without a redeploy.
    (env.SHIPPING_COUNTRIES || "CH")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((country, i) => {
        form.set(`shipping_address_collection[allowed_countries][${i}]`, country);
      });

    (env.SHIPPING_RATES || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
      .forEach((rate, i) => {
        form.set(`shipping_options[${i}][shipping_rate]`, rate);
      });

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
