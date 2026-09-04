import { Suspense } from "react";
import JournalBrowser, { JournalFallback } from "@/components/JournalBrowser";
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
      {/* The filters read the query string, which only exists in the browser.
          Until they hydrate, the prerendered page shows every story — so the
          static HTML (and anyone without JavaScript) still gets the journal. */}
      <Suspense fallback={<JournalFallback posts={posts} />}>
        <JournalBrowser posts={posts} categories={getJournalCategories()} />
      </Suspense>
    </div>
  );
}
