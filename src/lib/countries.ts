/**
 * Countries offered at checkout, grouped so the common ones are reachable
 * without scrolling. The chosen country decides the shipping zone, and the
 * Worker locks Stripe's address form to it — so this list must stay in step
 * with the zones in content/shipping.json.
 */

export interface CountryGroup {
  label: string;
  countries: { code: string; name: string }[];
}

export const COUNTRY_GROUPS: CountryGroup[] = [
  {
    label: "Switzerland",
    countries: [
      { code: "CH", name: "Switzerland" },
      { code: "LI", name: "Liechtenstein" },
    ],
  },
  {
    label: "Europe",
    countries: [
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CZ", name: "Czechia" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "NL", name: "Netherlands" },
      { code: "NO", name: "Norway" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "GB", name: "United Kingdom" },
    ],
  },
  {
    label: "Rest of the world",
    countries: [
      { code: "AU", name: "Australia" },
      { code: "BR", name: "Brazil" },
      { code: "CA", name: "Canada" },
      { code: "JP", name: "Japan" },
      { code: "MX", name: "Mexico" },
      { code: "NZ", name: "New Zealand" },
      { code: "SG", name: "Singapore" },
      { code: "ZA", name: "South Africa" },
      { code: "KR", name: "South Korea" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "US", name: "United States" },
    ],
  },
];

export const DEFAULT_COUNTRY = "CH";
