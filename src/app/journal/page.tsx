import Link from "next/link";
import { getAllJournalPosts } from "@/lib/content";

export const metadata = {
  title: "Journal — The Ground Squirrel Café",
};

export default function JournalPage() {
  const posts = getAllJournalPosts();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl sm:text-4xl text-center mb-3">Journal</h1>
      <p className="text-center text-ink/70 max-w-xl mx-auto mb-12">
        Stories, hikes, and slow travel from wherever Humbär takes us.
      </p>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/journal/${post.slug}`}
            className="group block mb-8 break-inside-avoid"
          >
            <div className="overflow-hidden rounded-xl border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover}
                alt={post.title}
                loading="lazy"
                className="block w-full h-auto transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-4">
              <p className="text-xs text-ink/50 mb-1">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {post.author}
              </p>
              <h2 className="text-lg sm:text-xl group-hover:text-rose transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-ink/70 mt-1">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
