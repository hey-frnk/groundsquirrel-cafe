import { getPage, markdownToHtml } from "@/lib/content";
import { formatPrice } from "@/lib/shop";
import { SHIP_TO_COUNTRIES } from "@/lib/countries";
import { PROFILES, rateFor } from "@/lib/shipping";
import ShippingLookup from "@/components/shop/ShippingLookup";

interface ShopPolicyPage {
  title: string;
  intro: string;
  /** The "pay the highest rate once" line, right above the country picker. */
  shippingRule: string;
  /** Markdown shown under the rates; the rates themselves come from content/shipping.json. */
  shipping: string;
}

// Unlike Impressum and Datenschutz this page is meant to be found: people
// search for a shop's return policy before they buy.
export const metadata = {
  title: "Shipping & Returns",
  alternates: { canonical: "/shipping-returns/" },
  description:
    "Shipping rates for every country, paid once per order. 14-day returns, and what happens if your order arrives damaged.",
};

/**
 * Countries that pay the same rate for every kind of item share a row, so the
 * table stays a handful of lines instead of 128. The biggest of those groups
 * is the "everywhere else" row.
 */
function rateRows() {
  const profiles = Object.values(PROFILES);
  const groups = new Map<string, { rates: (number | null)[]; names: string[] }>();
  for (const country of SHIP_TO_COUNTRIES) {
    const rates = profiles.map((p) => rateFor(p, country.code));
    const key = rates.join("|");
    const group = groups.get(key) ?? { rates, names: [] };
    group.names.push(country.name);
    groups.set(key, group);
  }
  const all = [...groups.values()];
  const rest = all.reduce((a, b) => (b.names.length > a.names.length ? b : a));
  return {
    named: all.filter((g) => g !== rest).sort((a, b) => a.names[0].localeCompare(b.names[0], "en")),
    rest,
  };
}

export default async function ShippingReturnsPage() {
  const page = getPage<ShopPolicyPage>("shipping-returns");
  const [ruleHtml, shippingHtml, html] = await Promise.all([
    markdownToHtml(page.shippingRule ?? ""),
    markdownToHtml(page.shipping ?? ""),
    markdownToHtml(page.content),
  ]);
  const profiles = Object.values(PROFILES);
  const { named, rest } = rateRows();

  return (
    <div className="mx-auto max-w-2xl px-6 pt-16 pb-20 sm:pt-24">
      <h1 className="border-b border-ink/10 pb-8 text-4xl sm:text-5xl">{page.title}</h1>
      {page.intro && <p className="mt-8 text-graphite">{page.intro}</p>}

      <section id="shipping" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl">Shipping</h2>
        <div
          className="prose prose-sm mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: ruleHtml }}
        />
        <div className="mt-6">
          <ShippingLookup />
        </div>

        <details className="group/rates mt-4 text-sm">
          <summary className="cursor-pointer list-none text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-rose [&::-webkit-details-marker]:hidden">
            All rates by country, in CHF
            <span aria-hidden className="ml-1 inline-block transition-transform group-open/rates:rotate-90">
              →
            </span>
          </summary>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink/10 bg-paper">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10 text-left align-bottom">
                  <th scope="col" className="px-3 py-3 font-normal text-graphite/70">
                    Destination
                  </th>
                  {profiles.map((p) => (
                    <th key={p.label} scope="col" className="px-3 py-3 text-right font-normal text-ink">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {[...named, rest].map((group) => (
                  <tr key={group.names.join()}>
                    <th scope="row" className="px-3 py-2.5 text-left font-normal text-ink">
                      {group === rest
                        ? `All other countries (${rest.names.length})`
                        : group.names.join(", ")}
                    </th>
                    {group.rates.map((rate, i) => (
                      <td key={i} className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                        {rate === null ? "–" : formatPrice(rate).replace("CHF ", "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div
          className="prose prose-sm mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: shippingHtml }}
        />
      </section>

      <div
        className="prose mt-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
