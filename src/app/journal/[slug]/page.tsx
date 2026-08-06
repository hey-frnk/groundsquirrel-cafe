import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllJournalPosts, getJournalPost } from "@/lib/content";

export function generateStaticParams() {
  return getAllJournalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getAllJournalPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — The Ground Squirrel Café`,
    description: post.excerpt,
    // So a pinned or shared story carries its own cover photo and blurb.
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [post.cover],
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getAllJournalPosts();
  if (!posts.some((p) => p.slug === slug)) notFound();

  const post = await getJournalPost(slug);

  return (
    <article className="mx-auto max-w-[52.5rem] px-6 pt-12 pb-20 sm:pt-16">
      <Link href="/journal" className="link-arrow is-back">
        <span data-arrow aria-hidden>
          ←
        </span>
        Back to journal
      </Link>

      <header className="mt-12 border-b border-ink/10 pb-10 text-center sm:mt-16">
        <p className="eyebrow">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-3xl leading-[1.12] sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-graphite/60">
          Written by {post.author}
        </p>
      </header>

      <div
        className="prose prose-lg mt-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags?.length > 0 && (
        <div className="mt-14 flex flex-wrap justify-center gap-2 border-t border-ink/10 pt-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink/12 bg-ivory/25 px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-graphite/75"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Link href="/journal" className="link-arrow is-back">
          <span data-arrow aria-hidden className="inline-block rotate-180">
            →
          </span>
          All journal entries
        </Link>
      </div>
    </article>
  );
}
