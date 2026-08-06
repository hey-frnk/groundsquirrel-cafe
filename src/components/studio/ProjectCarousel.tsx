"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselProject {
  slug: string;
  title: string;
  subtitle?: string;
  kind?: string;
  status?: string;
  teaser?: string;
  image?: string;
  description: string;
}

/**
 * Three projects side by side on a desktop, sliding to one and a peek on a
 * phone.
 *
 * The track is a scroll-snap row rather than a JS-positioned slider, so a
 * trackpad swipe, a shift-scroll and the arrow buttons all move the same thing,
 * and every card stays a real link — reachable by tab and openable in a new
 * tab, which a click-handler carousel quietly takes away.
 */
export default function ProjectCarousel({ projects }: { projects: CarouselProject[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
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
    // Exactly one card, so a press always lands a card on the left edge.
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  if (projects.length === 0) return null;

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-ink hover:bg-ink hover:text-cream disabled:opacity-25 disabled:hover:border-ink/20 disabled:hover:bg-transparent disabled:hover:text-ink";

  return (
    <div>
      <ul
        ref={track}
        onScroll={sync}
        // The gutter lives inside each card rather than as a flex `gap`: with
        // mandatory snapping, a gap is a strip of scroll offset that is not any
        // card's start, and the track settles into it on load — leaving the
        // first card clipped against the edge.
        className="flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-2 [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project) => (
          <li
            key={project.slug}
            className="w-[82%] shrink-0 snap-start pr-6 sm:w-1/2 lg:w-1/3"
          >
            <Link href={`/studio/${project.slug}`} className="group flex h-full flex-col">
              <div className="paper-card relative aspect-[4/5] overflow-hidden">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    // Contained, never cropped: these are finished paintings and
                    // book covers, and a card frame has no business deciding
                    // which edge of one to cut off.
                    className="art-protected absolute inset-0 h-full w-full object-contain p-7 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ivory/40 px-6 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/studio/brand/studio-badge.webp"
                      alt=""
                      width={80}
                      height={80}
                      className="w-16 opacity-45"
                    />
                    <span className="text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60">
                      Bilder folgen
                    </span>
                  </span>
                )}
                {project.kind && (
                  <span className="absolute top-3 left-3 rounded-full bg-cream/92 px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-graphite backdrop-blur">
                    {project.kind}
                  </span>
                )}
              </div>

              <h3 className="mt-6 text-xl leading-snug transition-colors duration-300 group-hover:text-rose">
                {project.title}
              </h3>
              {project.status && (
                <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60">
                  {project.status}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-graphite/85">
                {project.teaser ?? project.description}
              </p>
              <span className="mt-4 text-[0.7rem] uppercase tracking-[0.18em] text-rose">
                Zum Projekt →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={atStart}
          aria-label="Previous projects"
          className={arrow}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={atEnd}
          aria-label="Next projects"
          className={arrow}
        >
          →
        </button>
      </div>
    </div>
  );
}
