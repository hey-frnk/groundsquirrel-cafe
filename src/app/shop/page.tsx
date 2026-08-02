import { getAllShopProducts } from "@/lib/content";
import ProductCard from "@/components/ProductCard";

export const metadata = {
  title: "Shop — The Ground Squirrel Café",
};

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
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
