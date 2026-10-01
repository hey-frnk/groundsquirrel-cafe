/**
 * Countries offered at checkout. The chosen country decides the shipping rate,
 * and the Worker locks Stripe's address form to it.
 *
 * The list itself lives in content/shipping.json (`shipTo`), which the Worker
 * also receives, so the dropdown and what checkout accepts cannot drift apart.
 * Because of the EU Packaging and Packaging Waste Regulation (PPWR), the shop
 * currently ships only to the countries listed there.
 */

import shipping from "../../content/shipping.json";

export interface Country {
  code: string;
  name: string;
}

export const SHIP_TO_COUNTRIES: Country[] = Object.entries(
  shipping.shipTo as Record<string, string>
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const DEFAULT_COUNTRY = "CH";
