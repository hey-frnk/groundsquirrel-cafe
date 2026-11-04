"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/shop";
import { DEFAULT_COUNTRY, SHIP_TO_COUNTRIES } from "@/lib/countries";
import { PROFILES, rateFor } from "@/lib/shipping";

/**
 * Pick a country, see what each kind of item costs to send there. Underneath,
 * a worked example of the "highest rate once" rule with that country's real
 * numbers, because the rule is easier to believe with a figure next to it.
 */
export default function ShippingLookup() {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);

  const rows = Object.entries(PROFILES)
    .map(([name, profile]) => ({ name, profile, rate: rateFor(profile, country) }))
    .filter((r): r is typeof r & { rate: number } => r.rate !== null);

  const sorted = [...rows].sort((a, b) => a.rate - b.rate);
  const cheapest = sorted[0];
  const priciest = sorted[sorted.length - 1];

  return (
    <section className="rounded-2xl border border-ink/10 bg-paper px-5 py-6 sm:px-7">
      <label
        htmlFor="shipping-country"
        className="mb-2 block text-[0.7rem] uppercase tracking-[0.14em] text-graphite/65"
      >
        Shipping to
      </label>
      <select
        id="shipping-country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full rounded-lg border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-rose focus:outline-none"
      >
        {SHIP_TO_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      <ul className="mt-5 divide-y divide-ink/10">
        {rows.map(({ name, profile, rate }) => (
          <li key={name} className="flex items-baseline justify-between gap-4 py-2.5">
            <span>
              <span className="text-sm text-ink">{profile.label}</span>
              {profile.minDays && profile.maxDays && (
                <span className="block text-xs text-graphite/65">
                  {profile.minDays}–{profile.maxDays} business days on the way
                </span>
              )}
            </span>
            <span className="text-sm tabular-nums text-ink">{formatPrice(rate)}</span>
          </li>
        ))}
      </ul>

      {cheapest && priciest && priciest.rate > cheapest.rate && (
        <p className="mt-5 rounded-xl bg-blush/60 px-4 py-3 text-sm leading-relaxed text-ink">
          {cheapest.profile.label} + {priciest.profile.label} in one order: you pay{" "}
          <strong>{formatPrice(priciest.rate)}</strong> shipping, not{" "}
          {formatPrice(cheapest.rate + priciest.rate)}.
        </p>
      )}
    </section>
  );
}
