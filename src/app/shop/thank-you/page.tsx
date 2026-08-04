import Link from "next/link";
import ClearCartOnMount from "@/components/shop/ClearCartOnMount";

export const metadata = {
  title: "Thank you — The Ground Squirrel Café",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <ClearCartOnMount />

      <p className="text-5xl mb-6" aria-hidden>
        🐿️
      </p>
      <h1 className="text-3xl sm:text-4xl leading-tight">Thank you</h1>
      <p className="mt-5 text-ink/75 leading-relaxed">
        Your order is in. A receipt is on its way to your inbox, and your prints
        are about to be made — everything is printed to order, so give it 3–5 days
        before it goes in the post.
      </p>
      <p className="mt-4 text-ink/75 leading-relaxed">
        Ten percent of what you just spent goes to wildlife conservation. Thank you
        for that too.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="rounded-full bg-rose px-6 py-3 text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Back to the shop
        </Link>
        <Link
          href="/journal"
          className="rounded-full border border-ink/20 px-6 py-3 transition-colors hover:bg-ivory"
        >
          Read the journal
        </Link>
      </div>

      <p className="mt-12 text-xs text-ink/50">
        Something not right? Write to{" "}
        <a
          href="mailto:hello@thegroundsquirrel.cafe"
          className="underline decoration-rose underline-offset-4"
        >
          hello@thegroundsquirrel.cafe
        </a>
        .
      </p>
    </div>
  );
}
