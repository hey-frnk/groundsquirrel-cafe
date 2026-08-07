import Link from "next/link";
import ClearCartOnMount from "@/components/shop/ClearCartOnMount";

export const metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 text-center">
      <ClearCartOnMount />

      <p className="eyebrow">Order received</p>
      <h1 className="mt-6 text-4xl leading-[1.1] sm:text-5xl">Thank you</h1>
      <span aria-hidden className="rule mx-auto mt-8" />
      <p className="mt-8 leading-relaxed text-graphite">
        Your order is in. A receipt is on its way to your inbox, and your prints
        are about to be made — everything is printed to order, so give it 3–5 days
        before it goes in the post.
      </p>
      <p className="mt-4 leading-relaxed text-graphite">
        Ten percent of what you just spent goes to wildlife conservation. Thank you
        for that too.
      </p>

      <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="btn btn-primary">
          Back to the shop
        </Link>
        <Link href="/journal" className="btn btn-outline">
          Read the journal
        </Link>
      </div>

      <p className="mt-14 text-xs text-graphite/70">
        Something not right? Write to{" "}
        <a
          href="mailto:hello@thegroundsquirrel.cafe"
          className="link-underline text-ink"
        >
          hello@thegroundsquirrel.cafe
        </a>
        .
      </p>
    </div>
  );
}
