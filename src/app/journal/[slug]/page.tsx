import Link from "next/link";
import { notFound } from "next/navigation";
import AuthorCard from "@/components/AuthorCard";
import ImageZoom from "@/components/ImageZoom";
import JsonLd from "@/components/JsonLd";
import LanguageSwitch from "@/components/LanguageSwitch";
import MapEmbeds from "@/components/MapEmbeds";
import ShareRow from "@/components/ShareRow";
import { getAllJournalPosts, getJournalAuthor, getJournalPost } from "@/lib/content";
import { SITE_URL, organization } from "@/lib/seo";

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
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${slug}/` },
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
  const author = getJournalAuthor(post.author);

  return (
    <article className="mx-auto max-w-[52.5rem] px-6 pt-12 pb-20 sm:pt-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${SITE_URL}/journal/${slug}/#post`,
          mainEntityOfPage: `${SITE_URL}/journal/${slug}/`,
          url: `${SITE_URL}/journal/${slug}/`,
          headline: post.title,
          description: post.excerpt,
          image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
          datePublished: post.date,
          // Nothing on this site records an edit date, so the publication date
          // is the only honest answer to "when was this last touched".
          dateModified: post.date,
          keywords: post.tags?.length ? post.tags.join(", ") : undefined,
          author: { "@type": "Person", name: post.author },
          publisher: organization(),
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />

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
        <h1
          data-lang="en"
          className="mx-auto mt-6 max-w-3xl text-balance text-3xl leading-[1.12] sm:text-5xl"
        >
          {post.title}
        </h1>
        {/* Both versions are in the page; LanguageSwitch hides one of them. Until
            it hydrates the German one stays hidden, so the page reads correctly
            with no JavaScript at all. */}
        {post.german && (
          <h1
            data-lang="de"
            lang="de"
            hidden
            className="mx-auto mt-6 max-w-3xl text-balance text-3xl leading-[1.12] sm:text-5xl"
          >
            {post.german.title}
          </h1>
        )}
        <p className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-graphite/60">
          Written by {post.author}
          {post.categories.map((category) => (
            <span key={category}>
              <span aria-hidden className="mx-2.5 text-graphite/30">
                /
              </span>
              <Link
                href={`/journal/?category=${encodeURIComponent(category)}`}
                className="transition-colors duration-200 hover:text-ink"
              >
                {category}
              </Link>
            </span>
          ))}
        </p>

        {post.german && <LanguageSwitch />}
      </header>

      <div
        data-lang="en"
        className="prose prose-lg mt-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      {post.german && (
        <div
          data-lang="de"
          lang="de"
          hidden
          className="prose prose-lg mt-12 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.german.contentHtml }}
        />
      )}
      {/* Wires the click-to-load buttons of any [map:…] embeds in the post. */}
      <MapEmbeds />
      {/* Makes every photo in the post open full size. */}
      <ImageZoom />

      {post.tags?.length > 0 && (
        <div className="mt-14 flex flex-wrap justify-center gap-2 border-t border-ink/10 pt-8">
          {/* Every tag leads to the journal filtered by it — the way the tags
              on the old Squarespace blog did. */}
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/journal/?tag=${encodeURIComponent(tag)}`}
              className="rounded-full border border-ink/12 bg-ivory/25 px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-graphite/75 transition-colors duration-200 hover:border-ink/30 hover:text-ink"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {author && <AuthorCard author={author} />}

      <ShareRow
        slug={slug}
        title={post.title}
        excerpt={post.excerpt}
        cover={post.cover}
      />

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
