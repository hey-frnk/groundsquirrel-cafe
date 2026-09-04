import Link from "next/link";
import type { JournalAuthor } from "@/lib/content";

/**
 * Who wrote this. Sits at the end of a post and offers the two things a reader
 * might want next: everything else this person has written, and the longer
 * story about them on the crew page.
 */
export default function AuthorCard({ author }: { author: JournalAuthor }) {
  const journal = `/journal/?author=${encodeURIComponent(author.author)}`;

  return (
    <div className="mt-16 border-t border-ink/10 pt-10">
      <p className="eyebrow text-center">Written by</p>

      <div className="mt-6 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
        <Link href={journal} className="group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={author.photo}
            alt=""
            loading="lazy"
            className="h-24 w-24 rounded-full border border-ink/10 object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        <div>
          <Link href={journal} className="group">
            <span className="text-xl leading-snug transition-colors duration-300 group-hover:text-rose">
              {author.name}
            </span>
          </Link>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/55">
            {author.role}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-graphite/85">
            {author.excerpt}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-4 sm:justify-start">
            <Link href={journal} className="link-arrow">
              All stories by {author.author}
              <span data-arrow aria-hidden>
                →
              </span>
            </Link>
            <Link href={`/crew/#${author.slug}`} className="link-arrow">
              Read more about {author.author}
              <span data-arrow aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
