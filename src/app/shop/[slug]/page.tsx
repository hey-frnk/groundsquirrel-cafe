import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { getAllShopProducts, getShopProduct } from "@/lib/content";
import ProductDetail from "@/components/shop/ProductDetail";
import ReviewsSection from "@/components/shop/Reviews";
import { validReviews } from "@/lib/shop";
import { productSchema } from "@/lib/productSchema";
import { SITE_URL, contactEmail, googleLinks } from "@/lib/seo";

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
  const title = product.seoTitle ?? product.title;
  const description = product.seoDescription ?? product.tagline;
  return {
    title,
    description,
    keywords: product.keywords,
    alternates: { canonical: `/shop/${slug}/` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/shop/${slug}/`,
      images: [{ url: product.image, alt: product.imageAlt?.[product.image] ?? product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const reviews = validReviews(product);
  const google = googleLinks();

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-4 sm:px-10 sm:pt-16">
      {/* Read off the same content files the page renders and checkout charges
          from, so the rich result, the page and the price can never drift
          apart. See lib/productSchema.ts. */}
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop/` },
            {
              "@type": "ListItem",
              position: 2,
              name: product.title,
              item: `${SITE_URL}/shop/${slug}/`,
            },
          ],
        }}
      />
      {product.faq && product.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: product.faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }}
        />
      )}

      <Link href="/shop" className="link-arrow is-back">
        <span data-arrow aria-hidden>
          ←
        </span>
        Back to shop
      </Link>

      <div className="mt-12">
        <ProductDetail product={product} bodyHtml={product.bodyHtml} />
      </div>

      <div className="mt-24">
        <ReviewsSection
          reviews={reviews}
          googleReviewUrl={google.reviewUrl}
          contactEmail={contactEmail()}
        />
      </div>

      <div className="mt-28 border-t border-ink/10 pt-12 text-center">
        <p className="mx-auto max-w-md text-sm leading-relaxed text-graphite/85">
          Every order supports wildlife conservation and one very small art studio on wheels.
        </p>
        <Link href="/shop" className="link-arrow is-back mt-6">
          <span data-arrow aria-hidden>
            ←
          </span>
          All products
        </Link>
      </div>
    </div>
  );
}
