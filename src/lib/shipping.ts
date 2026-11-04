/**
 * Shipping rates from content/shipping.json, priced in the browser.
 *
 * The checkout Worker charges from the same table (written into its config by
 * scripts/sync-worker-config.mjs) and stays the authority on what is paid. This
 * copy only lets the cart and /shipping show the figure before checkout, so a
 * customer is not asked to click through to Stripe just to learn the postage.
 *
 * Kept free of Node built-ins, like shop.ts: the cart imports it.
 */

import shipping from "../../content/shipping.json";

export interface Profile {
  label: string;
  minDays?: number;
  maxDays?: number;
  rates: Record<string, number>;
}

const EUROPE: string[] = shipping.europe;
export const PROFILES = shipping.profiles as Record<string, Profile>;

/** Days an order waits to be made before it ships ("3–5 days before shipping"). */
export const HANDLING_DAYS = { min: 1, max: 5 };

/** Same lookup as rateFor() in checkout-worker/src/index.js. */
export function rateFor(profile: Profile, country: string): number | null {
  const { rates } = profile;
  if (typeof rates[country] === "number") return rates[country];
  if (EUROPE.includes(country) && typeof rates._EUROPE === "number") return rates._EUROPE;
  if (typeof rates._WORLD === "number") return rates._WORLD;
  return null;
}

export interface ShippingQuote {
  amount: number;
  /** The profile that set the price, i.e. the priciest thing to ship. */
  profile: Profile;
}

/**
 * Same rule as shippingFor() in the Worker: the order ships as one parcel, so
 * it pays the highest rate among its items once, never the sum.
 *
 * Returns null when any item has no known profile or no rate for the country.
 * The cart then falls back to "added at checkout" rather than show a number
 * the Worker might not agree with.
 */
export function shippingFor(
  profileNames: (string | undefined)[],
  country: string
): ShippingQuote | null {
  let best: ShippingQuote | null = null;
  for (const name of profileNames) {
    const profile = name ? PROFILES[name] : undefined;
    if (!profile) return null;
    const amount = rateFor(profile, country);
    if (amount === null) return null;
    if (!best || amount > best.amount) best = { amount, profile };
  }
  return best;
}
