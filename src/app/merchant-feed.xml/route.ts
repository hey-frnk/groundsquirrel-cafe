import { getAllShopProducts } from "@/lib/content";
import { CURRENCY, imagesFor } from "@/lib/shop";
import { SITE_URL } from "@/lib/seo";
import { variantDescription } from "@/lib/productSchema";
import { HANDLING_DAYS, PROFILES } from "@/lib/shipping";
import { BUILD_TIME, SALE, salePrice } from "@/lib/sale";

/**
 * Product feed for Google Merchant Center, written once at build time to
 * /merchant-feed.xml. Merchant Center fetches it on a schedule ("Add products
 * from a file" with this URL), so whatever the CMS publishes reaches Google
 * Shopping without anyone touching Merchant Center again.
 *
 * One item per variant, grouped by product with item_group_id, in the RSS 2.0
 * format Google documents. Prices come from the same files the checkout
 * charges from. Shipping is not listed per item: each variant carries its
 * shipping profile as shipping_label, and the shipping policies in Merchant
 * Center (kept in sync by scripts/sync-merchant-shipping.mjs) price that label
 * for all 128 countries. Per-item rates stop at 100 entries.
 */

export const dynamic = "force-static";

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

/** "2026-11-26T23:00+0000", the ISO 8601 form Google's examples use. */
function feedTime(time: number) {
  return `${new Date(time).toISOString().slice(0, 16)}+0000`;
}

/**
 * A sale that has not ended by the build goes out as sale_price with its
 * window. Merchant Center stops using it at the end of that window by itself,
 * even if the feed is not rebuilt in time.
 */
const saleInFeed = SALE.percentOff > 0 && BUILD_TIME < SALE.ends;
const saleWindow = `${feedTime(SALE.starts)}/${feedTime(SALE.ends)}`;

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
          (saleInFeed
            ? tag("sale_price", money(salePrice(variant.price))) +
              tag("sale_price_effective_date", saleWindow)
            : "") +
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
          // Picks the rate group in the Merchant Center shipping policies,
          // which scripts/sync-merchant-shipping.mjs writes from the same
          // profiles. Unknown profiles get no label and so no shipping.
          tag(
            "shipping_label",
            variant.shippingProfile && PROFILES[variant.shippingProfile]
              ? variant.shippingProfile
              : undefined
          ) +
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
