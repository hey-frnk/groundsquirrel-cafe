"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import {
  choicesFor,
  formatPrice,
  imagesFor,
  variantFor,
  type ShopProduct,
} from "@/lib/shop";
import { SHIP_TO_COUNTRIES } from "@/lib/countries";
import PaymentMethods from "./PaymentMethods";
import StoryCarousel from "./StoryCarousel";
import Waitlist from "./Waitlist";

export default function ProductDetail({
  product,
  bodyHtml,
}: {
  product: ShopProduct;
  bodyHtml: string;
}) {
  const axes = useMemo(() => product.optionAxes ?? [], [product.optionAxes]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      axes.map((axis) => [axis.id, product.variants[0]?.options?.[axis.id] ?? ""])
    )
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addLine } = useCart();

  const variant =
    axes.length > 0 ? variantFor(product, selection) : product.variants[variantIndex];
  const images = useMemo(() => imagesFor(product, variant), [product, variant]);
  const activeImage = images[Math.min(imageIndex, images.length - 1)];
  const alts = product.imageAlt ?? {};
  const photographic = Boolean(product.photographic);

  // Variants with a `group` are listed under that heading (Apple / Samsung).
  const groups = useMemo(() => {
    const byGroup = new Map<string, number[]>();
    product.variants.forEach((v, i) => {
      const key = v.group ?? "";
      byGroup.set(key, [...(byGroup.get(key) ?? []), i]);
    });
    return [...byGroup.entries()];
  }, [product.variants]);
  // When every variant costs the same, the price beside each one is just noise.
  const uniformPrice = new Set(product.variants.map((v) => v.price)).size <= 1;

  function selectVariant(index: number) {
    setVariantIndex(index);
    setImageIndex(0);
  }

  function selectOption(axisId: string, value: string) {
    setSelection((current) => ({ ...current, [axisId]: value }));
    setImageIndex(0);
  }

  /** "Eurasian Red Squirrel · A3 · Deutsch" — the label alone is not unique. */
  const variantDescription = variant
    ? axes.length > 0
      ? axes
          .map((axis) => variant.options?.[axis.id])
          .filter(Boolean)
          .join(" · ")
      : variant.label
    : "";

  function addToCart() {
    if (!variant) return;
    addLine({
      // Keyed on the SKU: with three option axes, six variants share the label
      // "Eurasian Red Squirrel", and keying on that would merge A3 English with
      // A5 German into one cart line.
      id: variant.sku ?? `${product.slug}::${variantDescription}`,
      productSlug: product.slug,
      productTitle: product.title,
      variantLabel: variantDescription,
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
      <div
        className={`grid gap-10 lg:gap-14 items-start ${
          // A full-bleed photo at the column's whole width towers over the
          // purchase panel, so photographs get a narrower column.
          photographic
            ? "lg:grid-cols-[minmax(0,38rem)_23rem] lg:justify-between"
            : "lg:grid-cols-[minmax(0,1fr)_23rem]"
        }`}
      >
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div
            className={`specimen-plate relative overflow-hidden ${
              photographic ? "aspect-[4/5]" : "aspect-square"
            }`}
          >
            <Image
              key={activeImage}
              src={activeImage}
              alt={alts[activeImage] ?? `${product.title}, ${variant?.label ?? ""}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={`animate-plate-in ${
                photographic ? "object-cover" : "object-contain p-6 sm:p-10"
              }`}
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
                  className={`relative h-16 w-16 overflow-hidden rounded-lg bg-ivory/25 transition-all sm:h-20 sm:w-20 ${
                    i === imageIndex
                      ? "outline outline-1 outline-offset-[3px] outline-rose"
                      : "opacity-65 outline outline-1 outline-ink/10 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className={photographic ? "object-cover" : "object-contain p-1"}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div>
          <p className="eyebrow">The Ground Squirrel Shop</p>
          <h1 className="mt-4 text-3xl leading-[1.1] sm:text-4xl">{product.title}</h1>
          {product.tagline && (
            <p className="mt-4 leading-relaxed text-graphite">{product.tagline}</p>
          )}

          {product.badges && product.badges.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-ink/15 bg-ivory/25 px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-graphite/80"
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 border-t border-ink/10 pt-7">
            {axes.length > 0 ? (
              <div className="space-y-5">
                {axes.map((axis) => (
                  <div key={axis.id}>
                    <label
                      htmlFor={`${product.slug}-${axis.id}`}
                      className="mb-3 block text-[0.7rem] uppercase tracking-[0.18em] text-graphite/65"
                    >
                      {axis.label}
                    </label>
                    <select
                      id={`${product.slug}-${axis.id}`}
                      value={selection[axis.id] ?? ""}
                      onChange={(e) => selectOption(axis.id, e.target.value)}
                      className="w-full rounded-lg border border-ink/20 bg-paper px-4 py-3.5 text-sm transition-colors hover:border-ink/40 focus:border-rose focus:outline-none"
                    >
                      {choicesFor(product, axis.id).map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label
                  htmlFor={`variant-${product.slug}`}
                  className="mb-3 block text-[0.7rem] uppercase tracking-[0.18em] text-graphite/65"
                >
                  {product.variantPrompt ?? "Choose your design"}
                </label>
                <select
                  id={`variant-${product.slug}`}
                  value={variantIndex}
                  onChange={(e) => selectVariant(Number(e.target.value))}
                  className="w-full rounded-lg border border-ink/20 bg-paper px-4 py-3.5 text-sm transition-colors hover:border-ink/40 focus:border-rose focus:outline-none"
                >
                  {groups.map(([group, indices]) => {
                    const options = indices.map((i) => (
                      <option key={product.variants[i].label} value={i}>
                        {product.variants[i].label}
                        {uniformPrice ? "" : ` - ${formatPrice(product.variants[i].price)}`}
                      </option>
                    ));
                    return group ? (
                      <optgroup key={group} label={group}>
                        {options}
                      </optgroup>
                    ) : (
                      options
                    );
                  })}
                </select>
              </>
            )}

            {variant?.note && (
              <p className="mt-4 text-sm leading-relaxed text-graphite/80">
                {variant.note}
              </p>
            )}

            <p className="mt-8 font-display text-4xl text-ink">
              {variant ? formatPrice(variant.price) : ""}
            </p>

            <button type="button" onClick={addToCart} className="btn btn-primary mt-6 w-full">
              {justAdded ? "Added to cart" : "Add to cart"}
            </button>

            <PaymentMethods className="mt-4" />
            <p className="mt-3 text-xs text-graphite/70">
              14-day returns, free replacement if it arrives damaged.{" "}
              <Link
                href="/shipping-returns"
                className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-rose"
              >
                Shipping &amp; returns
              </Link>
            </p>

            {product.shippingNote && (
              <p className="mt-6 text-xs leading-relaxed text-graphite/70">
                {product.shippingNote}
              </p>
            )}

            {product.showShipTo && (
              <>
                <details className="group/ship mt-4 text-xs text-graphite/70">
                  <summary className="cursor-pointer list-none text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-rose [&::-webkit-details-marker]:hidden">
                    Countries I ship to ({SHIP_TO_COUNTRIES.length})
                    <span aria-hidden className="ml-1 inline-block transition-transform group-open/ship:rotate-90">
                      →
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed">
                    {SHIP_TO_COUNTRIES.map((c) => c.name).join(", ")}
                  </p>
                </details>
                <div className="mt-4">
                  <Waitlist product={product.title} compact />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="mt-20 grid lg:grid-cols-[minmax(0,1fr)_23rem] gap-10 lg:gap-14 items-start">
        <div className="min-w-0">
          {product.story && product.story.length > 0 && (
            <div className="mb-14">
              <StoryCarousel images={product.story} alts={alts} title={product.storyTitle} />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>

        {/* Side column: field notes, then the questions, beside the story. The
            top margin matches the carousel's header row, so the notes start
            level with its pictures rather than with its arrows. */}
        <div
          className={`space-y-12 ${
            product.story && product.story.length > 0 ? "lg:mt-[4.25rem]" : ""
          }`}
        >
          {product.specs && product.specs.length > 0 && (
            <aside className="rounded-2xl border border-ink/12 bg-ivory/25 p-7">
              <h2 className="eyebrow mb-5">Field notes</h2>
              <dl className="space-y-3.5 text-sm">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="spec-row">
                    <dt className="shrink-0 text-graphite/70">{spec.label}</dt>
                    <dd className="text-right text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}

          {product.faq && product.faq.length > 0 && (
            <section>
              <h2 className="eyebrow mb-4">Questions &amp; answers</h2>
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {product.faq.map((item) => (
                  <details key={item.q} className="group/faq py-4">
                    <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 leading-snug transition-colors hover:text-rose [&::-webkit-details-marker]:hidden">
                      <h3 className="font-display text-base">{item.q}</h3>
                      <span aria-hidden className="shrink-0 text-graphite/50 transition-transform group-open/faq:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-graphite/85">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
