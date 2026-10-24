import { getAllShopProducts } from "@/lib/content";
import { CURRENCY, imagesFor } from "@/lib/shop";
import { SITE_URL } from "@/lib/seo";
import { HANDLING_DAYS, PROFILES, rateFor, variantDescription } from "@/lib/productSchema";
import shipping from "../../../content/shipping.json";

/**
 * Product feed for Google Merchant Center, written once at build time to
 * /merchant-feed.xml. Merchant Center fetches it on a schedule ("Add products
 * from a file" with this URL), so whatever the CMS publishes reaches Google
 * Shopping without anyone touching Merchant Center again.
 *
 * One item per variant, grouped by product with item_group_id, in the RSS 2.0
 * format Google documents. Prices and shipping come from the same files the
 * checkout charges from.
 */

export const dynamic = "force-static";

/**
 * Countries the feed lists shipping for. Merchant Center only shows an item in
 * a country it has a shipping rate for, so this is also the list of countries
 * that can be targeted. Kept short on purpose: 128 countries under each of 90
 * variants would make the file enormous. Add a code here to target it too.
 */
const FEED_COUNTRIES = ["CH", "GB", "US", "CA", "AU", "NZ"].filter(
  (code) => code in shipping.shipTo
);

const MAX_ADDITIONAL_IMAGES = 10;

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(name: string, value: string | number | undefined) {
  return value === undefined || value === "" ? "" : `<g:${name}>${escape(String(value))}</g:${name}>`;
}

function money(amount: number) {
  return `${amount.toFixed(2)} ${CURRENCY}`;
}

export function GET() {
  const items: string[] = [];

  for (const product of getAllShopProducts()) {
    const pageUrl = `${SITE_URL}/shop/${product.slug}/`;
    const description = product.seoDescription ?? product.tagline ?? product.title;

    for (const variant of product.variants) {
      // Without a SKU there is no stable id, and Google would see a new
      // product every time the list order changed.
      if (!variant.sku) continue;

      const images = variant.images?.length ? variant.images : imagesFor(product, variant);
      const [lead, ...rest] = images;
      const profile = variant.shippingProfile ? PROFILES[variant.shippingProfile] : undefined;

      const shippingTags = profile
        ? FEED_COUNTRIES.map((country) => {
            const rate = rateFor(profile, country);
            if (rate === null) return "";
            return (
              "<g:shipping>" +
              tag("country", country) +
              tag("price", money(rate)) +
              tag("min_transit_time", profile.minDays) +
              tag("max_transit_time", profile.maxDays) +
              "</g:shipping>"
            );
          }).join("")
        : "";

      items.push(
        "<item>" +
          tag("id", variant.sku) +
          tag("item_group_id", product.slug) +
          tag("title", `${product.title}, ${variantDescription(product, variant)}`.slice(0, 150)) +
          tag("description", description) +
          tag("link", `${pageUrl}?sku=${encodeURIComponent(variant.sku)}`) +
          tag("image_link", `${SITE_URL}${lead}`) +
          rest
            .slice(0, MAX_ADDITIONAL_IMAGES)
            .map((src) => tag("additional_image_link", `${SITE_URL}${src}`))
            .join("") +
          tag("availability", "in_stock") +
          tag("price", money(variant.price)) +
          tag("condition", "new") +
          tag("brand", "the ground squirrel studio") +
          // Our own designs carry no GTIN; the SKU is the manufacturer number.
          tag("identifier_exists", "no") +
          tag("mpn", variant.sku) +
          tag("google_product_category", product.googleCategory) +
          tag("size", variant.options?.size) +
          tag("pattern", variant.options?.design) +
          tag("min_handling_time", HANDLING_DAYS.min) +
          tag("max_handling_time", HANDLING_DAYS.max) +
          shippingTags +
          "</item>"
      );
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    "<channel>\n" +
    "<title>The Ground Squirrel Café</title>\n" +
    `<link>${SITE_URL}/shop/</link>\n` +
    "<description>Hand-painted wildlife art: prints, stickers, postcards and phone cases.</description>\n" +
    items.join("\n") +
    "\n</channel>\n</rss>\n";

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
