/**
 * schema.org data for one product page, shaped for Google's merchant listings
 * (Shopping tab, image search) and not just the product snippet.
 *
 * Every variant becomes its own Product with its own price, so a search for
 * "iPhone 15 squirrel case" can land on exactly that case. Shipping rates come
 * from content/shipping.json, the same table the checkout Worker charges from,
 * so what Google shows and what checkout charges cannot disagree.
 */

import shipping from "../../content/shipping.json";
import { SITE_URL, organization } from "./seo";
import {
  CURRENCY,
  averageRating,
  imagesFor,
  validReviews,
  type ShopProduct,
  type ShopVariant,
} from "./shop";

export interface Profile {
  minDays?: number;
  maxDays?: number;
  rates: Record<string, number>;
}

const SHIP_TO = Object.keys(shipping.shipTo);
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

function businessDays(min: number, max: number) {
  return { "@type": "QuantitativeValue", minValue: min, maxValue: max, unitCode: "DAY" };
}

/**
 * One OfferShippingDetails per distinct rate, each listing the countries that
 * pay it. Defined once per profile and referenced by @id from every variant,
 * so 42 phone cases do not repeat 128 countries 42 times.
 */
function shippingNode(name: string, base: string) {
  const profile = PROFILES[name];
  if (!profile) return [];
  const byRate = new Map<number, string[]>();
  for (const country of SHIP_TO) {
    const rate = rateFor(profile, country);
    if (rate === null) continue;
    byRate.set(rate, [...(byRate.get(rate) ?? []), country]);
  }
  return [...byRate.entries()].map(([rate, countries]) => ({
    "@type": "OfferShippingDetails",
    "@id": `${base}#shipping-${name}-${String(rate).replace(".", "-")}`,
    shippingRate: { "@type": "MonetaryAmount", value: rate, currency: CURRENCY },
    shippingDestination: countries.map((addressCountry) => ({
      "@type": "DefinedRegion",
      addressCountry,
    })),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: businessDays(HANDLING_DAYS.min, HANDLING_DAYS.max),
      transitTime: businessDays(profile.minDays ?? 3, profile.maxDays ?? 10),
    },
  }));
}

/** The policy on /shipping-returns/, in the words Google understands. */
function returnPolicy(base: string) {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": `${base}#returns`,
    applicableCountry: SHIP_TO,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    merchantReturnLink: `${SITE_URL}/shipping-returns/`,
  };
}

/** "iPhone 15" or "Eastern Gray Squirrel · A3 · English". */
export function variantDescription(product: ShopProduct, variant: ShopVariant) {
  const axes = product.optionAxes ?? [];
  if (axes.length === 0) return variant.label;
  return axes
    .map((axis) => variant.options?.[axis.id])
    .filter(Boolean)
    .join(" · ");
}

/** Only the axes schema.org has a name for; Language and phone model have none. */
const VARIES_BY: Record<string, string> = {
  design: "https://schema.org/pattern",
  size: "https://schema.org/size",
  color: "https://schema.org/color",
};

export function productSchema(product: ShopProduct) {
  const url = `${SITE_URL}/shop/${product.slug}/`;
  const reviews = validReviews(product);
  const average = averageRating(reviews);
  const brand = { "@type": "Brand", name: "the ground squirrel studio" };
  const absolute = (src: string) => `${SITE_URL}${src}`;

  const profiles = [
    ...new Set(product.variants.map((v) => v.shippingProfile).filter(Boolean)),
  ] as string[];
  const shippingNodes = Object.fromEntries(profiles.map((p) => [p, shippingNode(p, url)]));

  const variants = product.variants.map((variant) => {
    const label = variantDescription(product, variant);
    const shippingDetails = variant.shippingProfile
      ? shippingNodes[variant.shippingProfile].map((node) => ({ "@id": node["@id"] }))
      : undefined;
    return {
      "@type": "Product",
      ...(variant.sku ? { "@id": `${url}#${variant.sku}`, sku: variant.sku, mpn: variant.sku } : {}),
      name: `${product.title}, ${label}`,
      // The variant's own pictures, or else the lead photo: repeating the full
      // gallery under 42 phone cases would add 40 KB to the page for nothing.
      image: (variant.images?.length ? variant.images : [imagesFor(product, variant)[0]]).map(absolute),
      brand,
      ...(variant.options?.size ? { size: variant.options.size } : {}),
      ...(variant.options?.design ? { pattern: variant.options.design } : {}),
      offers: {
        "@type": "Offer",
        // Opens the page with this variant already chosen.
        url: variant.sku ? `${url}?sku=${encodeURIComponent(variant.sku)}` : url,
        price: variant.price.toFixed(2),
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#organization` },
        ...(shippingDetails?.length ? { shippingDetails } : {}),
        hasMerchantReturnPolicy: { "@id": `${url}#returns` },
      },
    };
  });

  const rating =
    average !== undefined
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.date,
            reviewBody: r.text,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          })),
        }
      : {};

  const variesBy = (product.optionAxes ?? [])
    .map((axis) => VARIES_BY[axis.id])
    .filter(Boolean);

  const group = {
    "@type": "ProductGroup",
    "@id": `${url}#product`,
    productGroupID: product.slug,
    name: product.title,
    description: product.seoDescription ?? product.tagline,
    url,
    image: [product.image, ...(product.gallery ?? [])]
      .filter((src, i, all) => all.indexOf(src) === i)
      .map(absolute),
    brand,
    ...(product.keywords?.length ? { keywords: product.keywords.join(", ") } : {}),
    ...(product.specs?.length
      ? {
          additionalProperty: product.specs.map((spec) => ({
            "@type": "PropertyValue",
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
    ...(variesBy.length ? { variesBy } : {}),
    hasVariant: variants,
    ...rating,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      group,
      organization(),
      returnPolicy(url),
      ...Object.values(shippingNodes).flat(),
    ],
  };
}
