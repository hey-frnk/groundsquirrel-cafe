"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A run of story slides about a product, two side by side on a wide screen and
 * one with a peek on a phone.
 *
 * Same approach as the studio's ProjectCarousel: a scroll-snap row, so a swipe,
 * a trackpad and the arrow buttons all move the same track, with no slider
 * library and nothing positioned by script.
 */
export default function StoryCarousel({
  images,
  alts = {},
  title,
}: {
  images: string[];
  alts?: Record<string, string>;
  title?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    setCurrent(Math.round(el.scrollLeft / step));
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (images.length === 0) return null;

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-cream disabled:opacity-25 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink";

  return (
    <section aria-label={title ?? "Product story"}>
      <div className="mb-6 flex items-end justify-between gap-6">
        {title && <h2 className="eyebrow">{title}</h2>}
        <div className="ml-auto flex items-center gap-3">
          <span className="font-stamp text-[0.7rem] tracking-[0.15em] text-ink/50 tabular-nums">
            {String(Math.min(current + 1, images.length)).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous slide"
            className={arrow}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next slide"
            className={arrow}
          >
            →
          </button>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={sync}
        // Gutter inside each slide rather than a flex gap, so mandatory snapping
        // never settles into the gap and clips the first slide.
        className="-mr-4 flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <li
            key={src}
            className="w-[86%] shrink-0 snap-start pr-4 sm:w-1/2"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-tile)] bg-ivory/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alts[src] ?? ""}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
