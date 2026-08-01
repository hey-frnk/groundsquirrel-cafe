import Image from "next/image";
import { getAllShopProducts } from "@/lib/content";

export const metadata = {
  title: "Shop — The Ground Squirrel Café",
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

export default function ShopPage() {
  const products = getAllShopProducts();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl sm:text-4xl text-center mb-4">Shop</h1>
      <p className="text-center text-ink/80 max-w-xl mx-auto mb-14">
        Squirrel stickers, phone cases, and other small treasures — made with love, shipped
        with care.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.slug} className="flex flex-col">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-ink/10 bg-ivory">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <h2 className="text-base mt-3">{product.title}</h2>
            <p className="text-sm text-ink/70 mb-2">{product.price}</p>
            {product.description && (
              <p className="text-xs text-ink/60 mb-2">{product.description}</p>
            )}
            {isPlaceholder(product.stripeLink) ? (
              <span className="text-xs text-ink/40 italic">Coming soon</span>
            ) : (
              <a
                href={product.stripeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-center rounded-full bg-rose text-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
              >
                Buy now
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
