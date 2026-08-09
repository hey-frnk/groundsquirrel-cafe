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
  /** Key into content/shipping.json profiles — decides the postage. */
  shippingProfile?: string;
  /** Values for each axis in ShopProduct.optionAxes, e.g. { size: "A3" }. */
  options?: Record<string, string>;
}

/** One dropdown on the product page, e.g. Design / Size / Language. */
export interface ShopOptionAxis {
  id: string;
  label: string;
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
  /** When set, the page shows one dropdown per axis instead of a single list. */
  optionAxes?: ShopOptionAxis[];
}

/** Distinct values for one axis, in the order the variants first mention them. */
export function choicesFor(product: ShopProduct, axisId: string): string[] {
  const seen = new Set<string>();
  for (const variant of product.variants) {
    const value = variant.options?.[axisId];
    if (value) seen.add(value);
  }
  return [...seen];
}

/**
 * The variant matching every selected option. Falls back to the closest match
 * so a selection that has no exact counterpart still lands somewhere sensible
 * rather than leaving the page with nothing to sell.
 */
export function variantFor(
  product: ShopProduct,
  selection: Record<string, string>
): ShopVariant | undefined {
  const axes = product.optionAxes ?? [];
  if (axes.length === 0) return product.variants[0];

  const exact = product.variants.find((v) =>
    axes.every((axis) => v.options?.[axis.id] === selection[axis.id])
  );
  if (exact) return exact;

  let best: ShopVariant | undefined;
  let bestScore = -1;
  for (const variant of product.variants) {
    const score = axes.filter((a) => variant.options?.[a.id] === selection[a.id]).length;
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }
  return best;
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
