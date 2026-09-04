"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { JournalPost } from "@/lib/content";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Deals the posts into columns like cards off a deck, so that reading the
 * finished page left-to-right and then down follows the order they were
 * written in. CSS multi-column would fill each column top to bottom first,
 * which puts the second-newest story at the *bottom* of column one.
 */
function deal<T>(items: T[], columns: number): T[][] {
  const dealt: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => dealt[i % columns].push(item));
  return dealt;
}

function Card({ post, eager }: { post: JournalPost; eager?: boolean }) {
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <article>
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-ivory/25 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt=""
            width={post.coverWidth}
            height={post.coverHeight}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            className="block h-auto w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </div>

        <p className="eyebrow mt-5">{formatDate(post.date)}</p>
        <h2 className="mt-3 text-xl leading-snug transition-colors duration-300 group-hover:text-rose sm:text-2xl">
          {post.title}
        </h2>
        <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-graphite/85">
          {post.excerpt}
        </p>
        <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/55">
          {post.author}
          {post.tags?.length > 0 && (
            <>
              <span aria-hidden className="mx-2 text-graphite/30">
                /
              </span>
              {post.tags.slice(0, 2).join(", ")}
            </>
          )}
        </p>
      </article>
    </Link>
  );
}

/**
 * The same posts laid out at one, two and three columns. Only one set is ever
 * displayed; the hidden ones cost markup but no bandwidth, because a lazy image
 * inside a `display: none` subtree never comes into view and so never loads.
 */
export function Pinboard({ posts }: { posts: JournalPost[] }) {
  const isEager = (post: JournalPost) => post === posts[0];

  return (
    <>
      <div className="flex flex-col gap-14 sm:hidden">
        {posts.map((post) => (
          <Card key={post.slug} post={post} eager={isEager(post)} />
        ))}
      </div>

      {[2, 3].map((columns) => (
        <div
          key={columns}
          className={
            columns === 2
              ? "hidden gap-8 sm:grid sm:grid-cols-2 lg:hidden"
              : "hidden gap-x-10 lg:grid lg:grid-cols-3"
          }
        >
          {deal(posts, columns).map((column, i) => (
            <div key={i} className="flex flex-col gap-16">
              {column.map((post) => (
                <Card key={post.slug} post={post} eager={isEager(post)} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

/** `/journal/?category=travel&tag=hiking`, with empty values left out. */
function journalHref(next: { category?: string | null; tag?: string | null }) {
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  const query = params.toString();
  return query ? `/journal/?${query}` : "/journal/";
}

function pill(active: boolean) {
  return [
    "rounded-full border px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] transition-colors duration-200",
    active
      ? "border-ink/35 bg-ink/8 text-ink"
      : "border-ink/12 bg-ivory/25 text-graphite/75 hover:border-ink/25 hover:text-ink",
  ].join(" ");
}

/**
 * Category and tag filtering for the journal, driven entirely by the query
 * string: the filtered view of `/journal/?tag=hiking` is a link anyone can
 * share, and the tags under every post link straight into it.
 *
 * Filtering happens here in the browser rather than on generated
 * `/journal/tag/<x>/` pages (the way Squarespace did it) so that the site stays
 * a flat static export - no page per tag, and no rebuild when a tag is renamed.
 */
export default function JournalBrowser({
  posts,
  categories,
}: {
  posts: JournalPost[];
  categories: string[];
}) {
  const params = useSearchParams();
  const category = params.get("category")?.toLowerCase() || null;
  const tag = params.get("tag")?.toLowerCase() || null;
  const [tagsOpen, setTagsOpen] = useState(false);

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (!category || post.categories.includes(category)) &&
          (!tag || post.tags.includes(tag))
      ),
    [posts, category, tag]
  );

  // Only tags that still lead somewhere within the chosen category, so the list
  // never offers a filter that would come back empty.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      if (category && !post.categories.includes(category)) continue;
      for (const t of post.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );
  }, [posts, category]);

  return (
    <>
      <nav aria-label="Filter by category" className="flex flex-wrap gap-2.5">
        <Link href={journalHref({ tag })} className={pill(!category)}>
          Everything
        </Link>
        {categories.map((c) => (
          <Link key={c} href={journalHref({ category: c, tag })} className={pill(category === c)}>
            {c}
          </Link>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <button
          type="button"
          onClick={() => setTagsOpen((open) => !open)}
          aria-expanded={tagsOpen}
          className="text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60 underline decoration-ink/20 underline-offset-4 transition-colors duration-200 hover:text-ink"
        >
          {tagsOpen ? "Hide tags" : `Browse ${tags.length} tags`}
        </button>

        {tag && (
          <Link
            href={journalHref({ category })}
            className="inline-flex items-center gap-2 rounded-full border border-rose/40 bg-rose/10 px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/80 transition-colors duration-200 hover:border-rose/70"
          >
            #{tag}
            <span aria-hidden>×</span>
            <span className="sr-only">Remove this tag filter</span>
          </Link>
        )}
      </div>

      {tagsOpen && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-ink/10 pt-5">
          {tags.map(([t, count]) => (
            <Link
              key={t}
              href={journalHref({ category, tag: t === tag ? null : t })}
              className={[
                "rounded-full border px-3 py-1 text-xs transition-colors duration-200",
                t === tag
                  ? "border-rose/50 bg-rose/10 text-ink"
                  : "border-ink/12 bg-ivory/25 text-graphite/75 hover:border-ink/25 hover:text-ink",
              ].join(" ")}
            >
              {t}
              <span className="ml-1.5 text-graphite/45">{count}</span>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/50">
        {filtered.length} {filtered.length === 1 ? "story" : "stories"}
      </p>

      <div className="mt-10 sm:mt-14">
        {filtered.length > 0 ? (
          <Pinboard posts={filtered} />
        ) : (
          <p className="py-16 text-center text-graphite/70">
            Nothing here yet.{" "}
            <Link href="/journal/" className="underline underline-offset-4">
              Show every story
            </Link>
            .
          </p>
        )}
      </div>
    </>
  );
}
