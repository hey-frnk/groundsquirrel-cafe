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
    <article className="mx-auto max-w-[52.5rem] px-5 py-12">
      <Link href="/journal" className="text-sm text-ink/60 hover:text-rose">
        ← Back to journal
      </Link>

      <header className="mt-6 mb-10 text-center">
        <p className="text-xs text-ink/50 mb-2">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · Written by {post.author}
        </p>
        <h1 className="text-2xl sm:text-4xl leading-snug">{post.title}</h1>
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-ivory rounded-full px-3 py-1 text-ink/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/journal" className="text-sm hover:text-rose transition-colors">
          ← Back to all journal entries
        </Link>
      </div>
    </article>
  );
}
