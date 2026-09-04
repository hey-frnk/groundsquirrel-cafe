import Link from "next/link";
import type { JournalAuthor } from "@/lib/content";

/**
 * Who wrote this. Sits at the end of a post and leads to everything else that
 * person has written — the journal filtered by them — with the crew page one
 * click further on for the longer story.
 */
export default function AuthorCard({ author }: { author: JournalAuthor }) {
  return (
    <div className="mt-16 border-t border-ink/10 pt-10">
      <p className="eyebrow text-center">Written by</p>

      <Link
        href={`/journal/?author=${encodeURIComponent(author.author)}`}
        className="group mt-6 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={author.photo}
          alt=""
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-full border border-ink/10 object-cover"
        />

        <div>
          <p className="text-xl leading-snug transition-colors duration-300 group-hover:text-rose">
            {author.name}
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/55">
            {author.role}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-graphite/85">
            {author.excerpt}
          </p>
          <p className="link-arrow mt-4">
            All stories by {author.author}
            <span data-arrow aria-hidden>
              →
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}
