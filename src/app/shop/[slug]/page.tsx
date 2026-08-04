import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllShopProducts, getShopProduct } from "@/lib/content";
import ProductDetail from "@/components/shop/ProductDetail";

export function generateStaticParams() {
  return getAllShopProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getAllShopProducts().find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.title} — The Ground Squirrel Café`,
    description: product.tagline,
    openGraph: {
      title: product.title,
      description: product.tagline,
      images: [product.image],
    },
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getAllShopProducts().some((p) => p.slug === slug)) notFound();

  const product = await getShopProduct(slug);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <Link href="/shop" className="text-sm text-ink/55 hover:text-rose transition-colors">
        ← Back to shop
      </Link>

      <div className="mt-8">
        <ProductDetail product={product} bodyHtml={product.bodyHtml} />
      </div>

      <div className="mt-24 text-center border-t border-ink/10 pt-12">
        <p className="text-ink/60 text-sm">
          Every order supports wildlife conservation and one very small art studio
          on wheels.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-4 text-sm hover:text-rose transition-colors"
        >
          ← Back to all products
        </Link>
      </div>
    </div>
  );
}
