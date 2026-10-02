import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { getAllShopProducts, getShopProduct } from "@/lib/content";
import ProductDetail from "@/components/shop/ProductDetail";
import { CURRENCY } from "@/lib/shop";
import { SITE_URL, organization } from "@/lib/seo";

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

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-4 sm:px-10 sm:pt-16">
      {/* Every field below is read off the same content file the page renders,
          so the rich result and the page can never drift apart. Prints are made
          to order, which is why availability is unconditional. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${SITE_URL}/shop/${slug}/#product`,
          name: product.title,
          description: product.seoDescription ?? product.tagline,
          image: [product.image, ...(product.gallery ?? [])]
            .filter((src, i, all) => all.indexOf(src) === i)
            .map((src) => `${SITE_URL}${src}`),
          url: `${SITE_URL}/shop/${slug}/`,
          brand: { "@type": "Brand", name: "the ground squirrel studio" },
          ...(product.keywords?.length ? { keywords: product.keywords.join(", ") } : {}),
          ...(product.specs?.length
            ? {
                additionalProperty: product.specs.map((spec) => ({
                  "@type": "PropertyValue",
                  name: spec.label,
                  value: spec.value,
                })),
              }
            : {}),
          offers: {
            "@type": "AggregateOffer",
            offerCount: product.variants.length,
            lowPrice: Math.min(...product.variants.map((v) => v.price)),
            highPrice: Math.max(...product.variants.map((v) => v.price)),
            priceCurrency: CURRENCY,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `${SITE_URL}/shop/${slug}/`,
            seller: organization(),
          },
        }}
      />
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
