/**
 * Shop types and money helpers.
 *
 * Kept free of `fs` and other Node built-ins on purpose: the cart runs in the
 * browser and needs these, so it must not pull in `content.ts`.
 */

export const CURRENCY = "CHF";

export interface ShopSpec {
  label: string;
  value: string;
}

export interface ShopVariant {
  label: string;
  /** Decimal amount in CURRENCY, e.g. 25 for CHF 25.00. */
  price: number;
  sku?: string;
  /** Stripe Price ID (price_...), filled in once the Stripe products exist. */
  stripePriceId?: string;
  note?: string;
  images?: string[];
}

export interface ShopProduct {
  slug: string;
  title: string;
  tagline?: string;
  image: string;
  order: number;
  badges?: string[];
  specs?: ShopSpec[];
  shippingNote?: string;
  gallery?: string[];
  variants: ShopVariant[];
}

export function formatPrice(amount: number): string {
  return `${CURRENCY} ${amount.toFixed(2)}`;
}

/** Stripe works in the smallest currency unit; CHF 25.00 becomes 2500. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/** Lowest price across a product's variants, for "from CHF X" on the index. */
export function lowestPrice(product: ShopProduct): number {
  if (product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((v) => v.price));
}

/** Images to show for a variant, falling back to the product's own gallery. */
export function imagesFor(product: ShopProduct, variant?: ShopVariant): string[] {
  const images = variant?.images?.length ? variant.images : product.gallery;
  return images?.length ? images : [product.image];
}

/**
 * Whether checkout can actually run yet. Until the Stripe prices exist, the
 * shop stays browsable but shows "coming soon" instead of taking money.
 */
export function isPurchasable(variant: ShopVariant): boolean {
  return Boolean(variant.stripePriceId);
}
