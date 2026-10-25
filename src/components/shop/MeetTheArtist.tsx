import Image from "next/image";
import Link from "next/link";

export interface MeetTheArtistContent {
  eyebrow: string;
  heading: string;
  role?: string;
  photo: string;
  photoAlt: string;
  noteLabel?: string;
  linkLabel?: string;
  linkUrl?: string;
}

/** Unfilled CMS text is marked PLATZHALTER and never reaches the live site. */
export function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

/**
 * The same short introduction on every product page, written once in
 * content/pages/meet-the-artist.md, plus an optional note per product on how
 * that piece was made. Placeholder notes show up in development only, dashed,
 * so the empty spots are easy to find.
 */
export default function MeetTheArtist({
  content,
  bioHtml,
  note,
}: {
  content: MeetTheArtistContent;
  bioHtml: string;
  note?: string;
}) {
  const showNote =
    Boolean(note) && (!isPlaceholder(note) || process.env.NODE_ENV === "development");

  return (
    <section
      aria-labelledby="meet-the-artist"
      className="rounded-2xl border border-ink/12 bg-ivory/25 p-6 sm:p-10"
    >
      {/* On a phone the portrait sits small beside the heading; from sm up it
          gets its own column and the text runs down beside it. */}
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-5 gap-y-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-x-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="art-frame overflow-hidden p-1 sm:row-span-2 sm:p-2">
          <Image
            src={content.photo}
            alt={content.photoAlt}
            width={1501}
            height={2000}
            sizes="(max-width: 640px) 6rem, 13rem"
            className="block aspect-[4/5] w-full rounded-[calc(var(--radius-tile)-0.4rem)] object-cover"
          />
        </div>

        <div className="self-center sm:self-start">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="meet-the-artist" className="mt-3 text-xl leading-[1.15] sm:mt-4 sm:text-3xl">
            {content.heading}
          </h2>
          {content.role && (
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-graphite/65 sm:mt-3 sm:text-[0.7rem]">
              {content.role}
            </p>
          )}
        </div>

        <div className="col-span-2 max-w-2xl sm:col-span-1 sm:col-start-2">
          <div
            className="prose prose-sm max-w-none prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bioHtml }}
          />

          {showNote && (
            <div
              className={`mt-7 border-l-2 pl-5 ${
                isPlaceholder(note) ? "border-dashed border-rose/60 opacity-70" : "border-rose/50"
              }`}
            >
              <h3 className="text-[0.7rem] uppercase tracking-[0.18em] text-graphite/65">
                {content.noteLabel ?? "About this piece"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">{note}</p>
            </div>
          )}

          {!isPlaceholder(content.linkUrl) && (
            <Link href={content.linkUrl!} className="link-arrow mt-8">
              {content.linkLabel ?? "Read my story"}
              <span data-arrow aria-hidden>
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
