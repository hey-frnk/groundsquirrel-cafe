import { Suspense } from "react";
import JournalBrowser, { Pinboard } from "@/components/JournalBrowser";
import { getAllJournalPosts, getJournalCategories } from "@/lib/content";

export const metadata = {
  title: "Journal",
  alternates: { canonical: "/journal/" },
  description:
    "Stories, hikes and slow travel from wherever Humbär takes us. Newest first.",
  openGraph: {
    title: "Journal — The Ground Squirrel Café",
    description: "Stories, hikes and slow travel from wherever Humbär takes us.",
    images: ["/images/journal/sichuan-road-trip/IMG_6571.jpg"],
  },
};

export default function JournalPage() {
  const posts = getAllJournalPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:px-10 sm:pt-24">
      <header className="border-b border-ink/10 pb-10">
        <p className="eyebrow">The Ground Squirrel Café</p>
        <h1 className="mt-5 text-5xl sm:text-7xl">Journal</h1>
      </header>

      <div className="mt-14 sm:mt-20">
        {/* The filters read the query string, which only exists in the browser.
            Until they hydrate, the prerendered page shows every story — so the
            static HTML (and anyone without JavaScript) still gets the journal. */}
        <Suspense
          fallback={
            <div className="mt-10 sm:mt-14">
              <Pinboard posts={posts} />
            </div>
          }
        >
          <JournalBrowser posts={posts} categories={getJournalCategories()} />
        </Suspense>
      </div>
    </div>
  );
}
