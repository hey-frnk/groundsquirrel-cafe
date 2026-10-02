import { getPage, markdownToHtml } from "@/lib/content";

interface ShopPolicyPage {
  title: string;
}

// Unlike Impressum and Datenschutz this page is meant to be found: people
// search for a shop's return policy before they buy.
export const metadata = {
  title: "Shipping & Returns",
  alternates: { canonical: "/shipping-returns/" },
  description:
    "Where and how we ship, 14-day returns, and what happens if your order arrives damaged.",
};

export default async function ShippingReturnsPage() {
  const page = getPage<ShopPolicyPage>("shipping-returns");
  const html = await markdownToHtml(page.content);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-16 pb-20 sm:pt-24">
      <h1 className="border-b border-ink/10 pb-8 text-4xl sm:text-5xl">{page.title}</h1>
      <div
        className="prose mt-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
