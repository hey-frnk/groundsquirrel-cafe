import Image from "next/image";
import Link from "next/link";
import { getAllShopProducts } from "@/lib/content";
import { formatPrice, lowestPrice } from "@/lib/shop";

export const metadata = {
  title: "Shop",
  alternates: { canonical: "/shop/" },
  description:
    "Hand-painted squirrel art prints and vinyl stickers. Made on the road, never by AI — 10% of every order funds wildlife conservation.",
};

const PROMISES = [
  {
    title: "Painted by hand",
    body: "Painted with heart and soul and absolutely no AI.",
  },
  {
    title: "Made on the road",
    body: "Each design was sketched where the animal actually lives, from inside Humbär.",
  },
  {
    title: "Printed near you",
    body: "Dispatched from the partner studio closest to your address, not shipped across the world.",
  },
];

export default function ShopPage() {
  const products = getAllShopProducts();

  return (
    <div className="pb-4">
      {/* Masthead */}
      <section className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 sm:pt-24">
        <div className="border-b border-ink/10 pb-10">
          <p className="eyebrow">The Ground Squirrel Café</p>
          <h1 className="mt-5 text-5xl sm:text-7xl">Shop</h1>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto mt-14 grid max-w-7xl gap-x-10 gap-y-14 px-6 sm:grid-cols-2 sm:px-10">
        {products.map((product) => (
          <Link key={product.slug} href={`/shop/${product.slug}`} className="group reveal block">
            <div className="specimen-plate relative aspect-[4/5] overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, 45vw"
                className="object-contain p-6 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute top-4 left-4 rounded-full bg-cream/92 px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-graphite backdrop-blur">
                from {formatPrice(lowestPrice(product))}
              </span>
            </div>

            <div className="mt-6 flex items-baseline justify-between gap-6">
              <h2 className="text-2xl transition-colors duration-300 group-hover:text-rose">
                {product.title}
              </h2>
              <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60">
                {product.variants.length} options
              </span>
            </div>
            {product.tagline && (
              <p className="mt-2 text-sm leading-relaxed text-graphite/85">{product.tagline}</p>
            )}
          </Link>
        ))}
      </section>

      {/* Conservation band */}
      <section className="band-ivory mt-28 px-6 py-20 sm:mt-36 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Why it matters</p>
          <h2 className="mt-6 text-balance text-3xl leading-[1.15] sm:text-[2.6rem]">
            Ten percent of every order funds wildlife conservation
          </h2>
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto mt-20 max-w-6xl px-6 sm:px-10">
        <div className="grid border-t border-ink/10 sm:grid-cols-3">
          {PROMISES.map((item, i) => (
            <div
              key={item.title}
              className="flex gap-5 border-b border-ink/10 py-8 sm:border-b-0 sm:px-7 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="mt-1 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/85">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
