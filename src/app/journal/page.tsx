import Link from "next/link";
import { getAllJournalPosts, type JournalPost } from "@/lib/content";

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
function Pinboard({ posts }: { posts: JournalPost[] }) {
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

export default function JournalPage() {
  const posts = getAllJournalPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:px-10 sm:pt-24">
      <header className="border-b border-ink/10 pb-10">
        <p className="eyebrow">The Ground Squirrel Café</p>
        <h1 className="mt-5 text-5xl sm:text-7xl">Journal</h1>
      </header>

      <div className="mt-14 sm:mt-20">
        <Pinboard posts={posts} />
      </div>
    </div>
  );
}
