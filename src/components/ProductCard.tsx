"use client";

import { useState } from "react";
import Image from "next/image";
import type { ShopProduct } from "@/lib/content";

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

export default function ProductCard({
  product,
}: {
  product: ShopProduct & { description: string };
}) {
  const variants = product.variants ?? [];
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = variants[variantIndex];

  const image = variant?.image || product.image;
  const price = variant?.price || product.price;
  const stripeLink = variant?.stripeLink ?? product.stripeLink;

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square rounded-xl overflow-hidden border border-ink/10 bg-ivory">
        <Image
          src={image}
          alt={variant ? `${product.title} — ${variant.label}` : product.title}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <h2 className="text-base mt-3">{product.title}</h2>
      <p className="text-sm text-ink/70 mb-2">{price}</p>
      {product.description && <p className="text-xs text-ink/60 mb-2">{product.description}</p>}

      {variants.length > 0 && (
        <select
          value={variantIndex}
          onChange={(e) => setVariantIndex(Number(e.target.value))}
          aria-label={`Option für ${product.title}`}
          className="mb-2 rounded-full border border-ink/20 bg-white/60 px-3 py-2 text-sm"
        >
          {variants.map((v, i) => (
            <option key={v.label} value={i}>
              {v.label}
            </option>
          ))}
        </select>
      )}

      {isPlaceholder(stripeLink) ? (
        <span className="text-xs text-ink/40 italic">Coming soon</span>
      ) : (
        <a
          href={stripeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-center rounded-full bg-rose text-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
        >
          Buy now
        </a>
      )}
    </div>
  );
}
