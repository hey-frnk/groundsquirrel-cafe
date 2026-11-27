/**
 * The storewide sale from content/sale.json, for the pages.
 *
 * The checkout Worker decides what is actually charged (it attaches the Stripe
 * coupon only while the sale runs); this copy only shows the same prices before
 * checkout. Kept free of Node built-ins, like shop.ts: the cart imports it.
 */

import sale from "../../content/sale.json";

export const SALE = {
  name: sale.name,
  percentOff: sale.percentOff,
  starts: Date.parse(sale.starts),
  /** First moment the sale is over. */
  ends: Date.parse(sale.ends),
};

/**
 * When the site was built, set in next.config.ts. The static HTML is rendered
 * as of this moment, and the browser hydrates against it before switching to
 * its own clock.
 */
export const BUILD_TIME = Number(process.env.BUILD_TIME) || 0;

export function saleActiveAt(time: number): boolean {
  return SALE.percentOff > 0 && time >= SALE.starts && time < SALE.ends;
}

/** Price after the sale discount, rounded to the centime as Stripe does. */
export function salePrice(price: number): number {
  return Math.round(price * (100 - SALE.percentOff)) / 100;
}

/** The last day of the sale in Swiss time, e.g. "November 30". */
export function saleLastDay(): string {
  return new Date(SALE.ends - 1).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "Europe/Zurich",
  });
}

/** The last day as YYYY-MM-DD in Swiss time, for priceValidUntil. */
export function saleLastDate(): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Date(SALE.ends - 1).toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" });
}
