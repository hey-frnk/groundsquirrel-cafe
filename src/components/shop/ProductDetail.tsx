"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatPrice, imagesFor, type ShopProduct } from "@/lib/shop";

export default function ProductDetail({
  product,
  bodyHtml,
}: {
  product: ShopProduct;
  bodyHtml: string;
}) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addLine } = useCart();

  const variant = product.variants[variantIndex];
  const images = useMemo(() => imagesFor(product, variant), [product, variant]);
  const activeImage = images[Math.min(imageIndex, images.length - 1)];

  function selectVariant(index: number) {
    setVariantIndex(index);
    setImageIndex(0);
  }

  function addToCart() {
    if (!variant) return;
    addLine({
      id: `${product.slug}::${variant.label}`,
      productSlug: product.slug,
      productTitle: product.title,
      variantLabel: variant.label,
      price: variant.price,
      image: images[0],
      sku: variant.sku,
      stripePriceId: variant.stripePriceId,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_23rem] gap-10 lg:gap-14 items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div className="specimen-plate relative aspect-square rounded-2xl overflow-hidden bg-ivory/40">
            <Image
              key={activeImage}
              src={activeImage}
              alt={`${product.title} — ${variant?.label ?? ""}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-3 sm:p-5 animate-plate-in"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === imageIndex}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-ivory/40 transition-all ${
                    i === imageIndex
                      ? "ring-2 ring-rose ring-offset-2 ring-offset-cream"
                      : "ring-1 ring-ink/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div>
          <h1 className="text-2xl sm:text-3xl leading-tight">{product.title}</h1>
          {product.tagline && (
            <p className="mt-2 text-ink/70 leading-relaxed">{product.tagline}</p>
          )}

          {product.badges && product.badges.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <li
                  key={badge}
                  className="text-[0.7rem] leading-none bg-lilac/25 border border-lilac/40 rounded-full px-3 py-1.5 text-ink/75"
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 border-t border-ink/10 pt-6">
            <label
              htmlFor={`variant-${product.slug}`}
              className="block text-xs uppercase tracking-[0.18em] text-ink/50 mb-2"
            >
              Choose your design
            </label>
            <select
              id={`variant-${product.slug}`}
              value={variantIndex}
              onChange={(e) => selectVariant(Number(e.target.value))}
              className="w-full rounded-xl border border-ink/20 bg-white/70 px-4 py-3 text-sm hover:border-ink/40 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30 transition-colors"
            >
              {product.variants.map((v, i) => (
                <option key={v.label} value={i}>
                  {v.label} — {formatPrice(v.price)}
                </option>
              ))}
            </select>

            {variant?.note && (
              <p className="mt-3 text-sm text-ink/60 italic leading-relaxed">
                {variant.note}
              </p>
            )}

            <p className="mt-6 text-3xl">{variant ? formatPrice(variant.price) : ""}</p>

            <button
              type="button"
              onClick={addToCart}
              className="mt-4 w-full rounded-full bg-rose px-6 py-3.5 text-ink transition-colors hover:bg-ink hover:text-cream focus:outline-none focus:ring-2 focus:ring-rose/40 focus:ring-offset-2 focus:ring-offset-cream"
            >
              {justAdded ? "Added to basket ✓" : "Add to basket"}
            </button>

            {product.shippingNote && (
              <p className="mt-5 text-xs text-ink/55 leading-relaxed">
                {product.shippingNote}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="mt-20 grid lg:grid-cols-[minmax(0,1fr)_23rem] gap-10 lg:gap-14 items-start">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {product.specs && product.specs.length > 0 && (
          <aside className="field-notes rounded-2xl border border-ink/12 bg-ivory/30 p-6">
            <h2 className="text-xs uppercase tracking-[0.18em] text-ink/50 mb-4">
              Field notes
            </h2>
            <dl className="space-y-3.5 text-sm">
              {product.specs.map((spec) => (
                <div key={spec.label} className="spec-row">
                  <dt className="text-ink/55 shrink-0">{spec.label}</dt>
                  <dd className="text-right text-ink/85">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </>
  );
}
