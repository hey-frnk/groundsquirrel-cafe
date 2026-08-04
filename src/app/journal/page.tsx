import Link from "next/link";
import { getAllJournalPosts, type JournalPost } from "@/lib/content";

export const metadata = {
  title: "Journal — The Ground Squirrel Café",
  description:
    "Stories, hikes and slow travel from wherever Humbär takes us — newest first.",
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
 * finished pinboard left-to-right and then down follows the order they were
 * written in. CSS multi-column would fill each column top to bottom first,
 * which puts the second-newest story at the *bottom* of column one.
 */
function deal<T>(items: T[], columns: number): T[][] {
  const dealt: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => dealt[i % columns].push(item));
  return dealt;
}

function Card({ post, eager }: { post: JournalPost; eager?: boolean }) {
  // A stable, content-derived tilt, so the wall looks pinned up by hand rather
  // than printed — and every card straightens when you reach for it.
  const tilt = post.slug.length % 2 === 0 ? "-rotate-[0.55deg]" : "rotate-[0.5deg]";

  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <article
        className={`paper-card overflow-hidden rounded-[1.4rem] transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0 ${tilt}`}
      >
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt=""
            width={post.coverWidth}
            height={post.coverHeight}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div className="px-5 pt-4 pb-5">
          <p className="flex items-center gap-2 text-[0.63rem] tracking-[0.2em] text-ink/45 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-rose/70" />
            {formatDate(post.date)} · {post.author}
          </p>
          <h2 className="mt-2 text-lg leading-snug transition-colors duration-300 group-hover:text-rose sm:text-xl">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink/70">{post.excerpt}</p>

          {post.tags?.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-lilac/50 bg-lilac/15 px-2.5 py-0.5 text-[0.62rem] text-ink/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
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
      <div className="flex flex-col gap-7 sm:hidden">
        {posts.map((post) => (
          <Card key={post.slug} post={post} eager={isEager(post)} />
        ))}
      </div>

      {[2, 3].map((columns) => (
        <div
          key={columns}
          className={
            columns === 2
              ? "hidden gap-5 sm:grid sm:grid-cols-2 lg:hidden"
              : "hidden gap-6 lg:grid lg:grid-cols-3"
          }
        >
          {deal(posts, columns).map((column, i) => (
            <div key={i} className={columns === 2 ? "flex flex-col gap-5" : "flex flex-col gap-6"}>
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
    <div className="mx-auto max-w-6xl px-5 pt-12 pb-20 sm:pt-16 sm:pb-28">
      <h1 className="mb-10 text-center text-4xl sm:mb-14 sm:text-5xl">Journal</h1>
      <Pinboard posts={posts} />
    </div>
  );
}
