import { averageRating, type ShopReview } from "@/lib/shop";

const STAR =
  "M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z";

/**
 * Five stars, filled to the rating. A fractional rating fills the last star
 * partway, so 4.6 reads as 4.6 and not as 5.
 */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex shrink-0 gap-[2px] text-rose" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        const id = `star-${i}-${Math.round(rating * 10)}-${size}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20">
            <defs>
              <linearGradient id={id}>
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="currentColor" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${id})`} />
          </svg>
        );
      })}
    </span>
  );
}

function reviewCount(n: number) {
  return `${n} ${n === 1 ? "review" : "reviews"}`;
}

/** "★★★★★ 4.9 · 12 reviews", linking down to the reviews on the page. */
export function RatingSummary({ reviews }: { reviews: ShopReview[] }) {
  const average = averageRating(reviews);
  if (average === undefined) return null;
  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-2 text-sm text-graphite transition-colors hover:text-rose"
    >
      <Stars rating={average} />
      <span>
        <span className="sr-only">Rated </span>
        {average.toFixed(1)}
        <span className="sr-only"> out of 5</span> · {reviewCount(reviews.length)}
      </span>
    </a>
  );
}

function formatMonth(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function ReviewCard({ review, product }: { review: ShopReview; product?: string }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-ink/12 bg-ivory/25 p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} />
        <span className="sr-only">{review.rating} out of 5 stars</span>
        {review.date && (
          <time dateTime={review.date} className="text-xs text-graphite/60">
            {formatMonth(review.date)}
          </time>
        )}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
        {review.text}
      </blockquote>
      <figcaption className="mt-5 text-xs leading-relaxed text-graphite/75">
        <span className="font-medium text-ink">{review.name}</span>
        {review.location && <>, {review.location}</>}
        <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.14em] text-graphite/55">
          Verified purchase
          {(product || review.variant) && <> · {[product, review.variant].filter(Boolean).join(", ")}</>}
        </span>
      </figcaption>
    </figure>
  );
}

/** The invitation under the reviews: Google first, email as the fallback. */
export function ReviewInvite({
  googleReviewUrl,
  contactEmail,
  className = "",
}: {
  googleReviewUrl?: string;
  contactEmail: string;
  className?: string;
}) {
  return (
    <p className={`text-sm leading-relaxed text-graphite/80 ${className}`}>
      Bought something from us? We would love to hear how you like it.{" "}
      {googleReviewUrl ? (
        <>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-rose"
          >
            Leave a review on Google
          </a>{" "}
          or{" "}
        </>
      ) : null}
      <a
        href={`mailto:${contactEmail}?subject=${encodeURIComponent("My review")}`}
        className="text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-rose"
      >
        {googleReviewUrl ? "write to us" : "Write to us"}
      </a>
      .
    </p>
  );
}

export default function ReviewsSection({
  reviews,
  googleReviewUrl,
  contactEmail,
}: {
  reviews: ShopReview[];
  googleReviewUrl?: string;
  contactEmail: string;
}) {
  const average = averageRating(reviews);

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-3 text-3xl">What customers say</h2>
        </div>
        {average !== undefined && (
          <div className="flex items-center gap-3">
            <Stars rating={average} size={18} />
            <span className="font-display text-2xl text-ink">{average.toFixed(1)}</span>
            <span className="text-sm text-graphite/70">{reviewCount(reviews.length)}</span>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={`${review.name}-${review.date}`}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-graphite/80">No reviews for this one yet.</p>
      )}

      <ReviewInvite googleReviewUrl={googleReviewUrl} contactEmail={contactEmail} className="mt-8" />
      {reviews.length > 0 && (
        <p className="mt-3 text-xs text-graphite/60">
          Every review here comes from someone who bought from us, shared with their
          permission. We publish all of them, not just the good ones.
        </p>
      )}
    </section>
  );
}
