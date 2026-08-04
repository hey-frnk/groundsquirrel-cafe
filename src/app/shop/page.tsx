import Image from "next/image";
import Link from "next/link";
import { getAllShopProducts } from "@/lib/content";
import { formatPrice, lowestPrice } from "@/lib/shop";

export const metadata = {
  title: "Shop — The Ground Squirrel Café",
  description:
    "Hand-painted squirrel art prints and vinyl stickers. Made on the road, never by AI — 10% of every order funds wildlife conservation.",
};

export default function ShopPage() {
  const products = getAllShopProducts();

  return (
    <div className="pb-24">
      {/* Masthead */}
      <section className="px-5 pt-14 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/45">
          The Ground Squirrel Café
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl leading-tight">Shop</h1>
        <p className="mt-5 mx-auto max-w-xl text-ink/70 leading-relaxed">
          Watercolour field guides to the animals most people walk straight past.
          Painted by hand from inside a vintage camper van — and never, ever by a
          machine.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3 text-ink/30">
          <span className="h-px w-12 bg-current" />
          <span aria-hidden>🐿️</span>
          <span className="h-px w-12 bg-current" />
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-5xl px-5 grid sm:grid-cols-2 gap-8 sm:gap-10">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="group block"
          >
            <div className="specimen-plate relative aspect-[4/5] rounded-2xl overflow-hidden bg-ivory/40">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, 45vw"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute top-4 left-4 text-[0.7rem] leading-none bg-cream/90 backdrop-blur rounded-full px-3 py-1.5 text-ink/70">
                from {formatPrice(lowestPrice(product))}
              </span>
            </div>

            <h2 className="mt-5 text-xl group-hover:text-rose transition-colors">
              {product.title}
            </h2>
            {product.tagline && (
              <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">
                {product.tagline}
              </p>
            )}
            <p className="mt-3 text-sm text-ink/45 group-hover:text-rose transition-colors">
              {product.variants.length} options →
            </p>
          </Link>
        ))}
      </section>

      {/* Conservation band */}
      <section className="mt-24 bg-ivory/40 border-y border-ink/10 py-14 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-4xl mb-4" aria-hidden>
            🌿
          </p>
          <h2 className="text-2xl leading-snug">
            Ten percent of every order funds wildlife conservation
          </h2>
          <p className="mt-4 text-ink/70 leading-relaxed">
            Not a marketing line. These animals sat still long enough to be
            painted, and this is the rent.
          </p>
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto max-w-4xl px-5 mt-16 grid sm:grid-cols-3 gap-8 text-center">
        {[
          {
            icon: "🖌️",
            title: "Painted by hand",
            body: "Watercolour and pencil, start to finish. No AI, no traced photographs.",
          },
          {
            icon: "🚐",
            title: "Made on the road",
            body: "Each design was sketched where the animal actually lives, from inside Humbär.",
          },
          {
            icon: "📦",
            title: "Printed near you",
            body: "Dispatched from the partner studio closest to your address, not shipped across the world.",
          },
        ].map((item) => (
          <div key={item.title}>
            <p className="text-2xl mb-3" aria-hidden>
              {item.icon}
            </p>
            <h3 className="text-base mb-2">{item.title}</h3>
            <p className="text-sm text-ink/65 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
