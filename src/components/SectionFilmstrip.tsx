"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface FilmstripItem {
  href: string;
  label: string;
  sub: string;
  poster: string;
  video: string;
  alt: string;
}

function connection() {
  return (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        addEventListener?: (type: string, fn: () => void) => void;
        removeEventListener?: (type: string, fn: () => void) => void;
      };
    }
  ).connection;
}

function videoAllowed() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const link = connection();
  if (link?.saveData) return false;
  if (link?.effectiveType && /^(slow-)?2g$/.test(link.effectiveType)) return false;
  return true;
}

/**
 * Read through useSyncExternalStore rather than an effect: the server has no
 * opinion on any of this, so it answers "no video" and the client corrects it
 * on the first commit without a second render pass.
 */
function useEnvironment() {
  const subscribe = useCallback((notify: () => void) => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    motion.addEventListener("change", notify);
    pointer.addEventListener("change", notify);
    connection()?.addEventListener?.("change", notify);
    return () => {
      motion.removeEventListener("change", notify);
      pointer.removeEventListener("change", notify);
      connection()?.removeEventListener?.("change", notify);
    };
  }, []);

  const allowed = useSyncExternalStore(subscribe, videoAllowed, () => false);
  const hoverable = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false
  );
  return { allowed, hoverable };
}

/**
 * Nothing here downloads a video until someone asks for one.
 *
 * Every panel ships as a poster — the video's own first frame, so the swap is
 * invisible — and the <video> element is only mounted once a panel becomes
 * active: hovered on a pointer device, or resting in the middle of the strip on
 * a touch one. A visitor who scrolls past the row costs 116 KB of stills rather
 * than 1.7 MB of film, and someone on a metered connection never loads a single
 * frame of video at all.
 */
export default function SectionFilmstrip({ items }: { items: FilmstripItem[] }) {
  // Which panel is playing. Only one ever is, on either kind of device.
  const [active, setActive] = useState<number | null>(null);
  // Panels that have ever been active keep their <video> mounted, so going back
  // to one already paid for is instant instead of a second download.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const { allowed, hoverable } = useEnvironment();
  const scroller = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activate = useCallback((index: number | null) => {
    setActive(index);
    if (index !== null) setLoaded((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }, []);

  // A mouse swept along the row passes over all five panels; without a moment
  // of intent that would start five downloads on the way past. Leaving is
  // immediate — only arriving waits.
  const hoverIntent = useCallback(
    (index: number | null) => {
      if (timer.current) clearTimeout(timer.current);
      if (index === null) {
        activate(null);
        return;
      }
      timer.current = setTimeout(() => activate(index), 130);
    },
    [activate]
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Play or rewind whenever the active panel changes, rather than from the
  // event handlers — that way hover and scroll can't fight over the same
  // element and leave two of them running.
  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        void video.play().catch(() => {});
      } else if (!video.paused || video.currentTime > 0) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [active, loaded]);

  // Touch: the panel resting nearest the middle of the strip is the one that
  // plays, and only after the scroll has settled — so flicking through the row
  // doesn't pull down five videos on the way past. And nothing at all happens
  // until the strip is actually on screen: it sits well below the fold, and a
  // visitor who never reaches it should never pay for it.
  useEffect(() => {
    const el = scroller.current;
    if (!allowed || hoverable || !el) return;
    let onScreen = false;

    const settle = () => {
      if (!onScreen) return;
      const box = el.getBoundingClientRect();
      const middle = box.left + box.width / 2;
      let best: number | null = null;
      let bestDistance = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const panel = child.getBoundingClientRect();
        const distance = Math.abs(panel.left + panel.width / 2 - middle);
        // Half a panel away is far enough that nothing is really "centred".
        if (distance < bestDistance && distance < panel.width / 2) {
          best = i;
          bestDistance = distance;
        }
      });
      activate(best);
    };

    const onScroll = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(settle, 320);
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) settle();
        else activate(null);
      },
      { threshold: 0.25 }
    );
    visibility.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      visibility.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [allowed, hoverable, activate]);

  return (
    <div
      ref={scroller}
      // Full bleed and butted edge to edge: five columns of 9:16 across the
      // whole window make one continuous band of film rather than five cards
      // on a shelf, and at exactly 9:16 nothing of any frame is cropped away.
      className="filmstrip flex snap-x snap-mandatory overflow-x-auto border-y border-ink/10 lg:grid lg:grid-cols-5 lg:overflow-visible"
    >
      {items.map((item, i) => {
        const on = active === i;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative w-[78vw] shrink-0 snap-center overflow-hidden bg-ink sm:w-[46vw] lg:w-auto"
            onPointerEnter={(e) => {
              if (allowed && hoverable && e.pointerType === "mouse") hoverIntent(i);
            }}
            onPointerLeave={(e) => {
              if (hoverable && e.pointerType === "mouse") hoverIntent(null);
            }}
            onFocus={() => allowed && hoverable && activate(i)}
            onBlur={() => hoverable && hoverIntent(null)}
          >
            <div className="relative aspect-9/16">
              <Image
                src={item.poster}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 20vw"
                className="object-cover"
              />

              {loaded.has(i) && (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                  src={item.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                  tabIndex={-1}
                />
              )}

              {/* Deep at the foot to carry the lettering, and a veil over the
                  whole column that lifts for the one being watched. */}
              <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-ink/25" />
              <div
                className={`absolute inset-0 bg-ink/30 transition-opacity duration-700 ${
                  on ? "opacity-0" : "opacity-100"
                }`}
              />

              <span className="absolute left-7 top-7 font-stamp text-[0.7rem] tracking-[0.22em] text-cream/60 sm:left-8 sm:top-8">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                {/* No button on any of the five: the mark of the live column is
                    this rule drawing itself out under its name, and the arrow
                    that steps in beside it. */}
                <span
                  aria-hidden
                  className={`block h-px origin-left bg-rose transition-transform duration-700 ease-out ${
                    on ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <h3 className="mt-6 flex items-center gap-3 font-display text-[clamp(1.65rem,2.5vw,2.9rem)] leading-none text-cream">
                  {item.label}
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={`h-[0.62em] w-[0.62em] shrink-0 transition-all duration-500 ${
                      on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                    }`}
                  >
                    <path d="M5 12h13M12 5l7 7-7 7" />
                  </svg>
                </h3>
                {/* Held in the flow so the name never shifts as it appears. */}
                <p
                  className={`mt-2.5 max-w-[22ch] text-[0.84rem] leading-snug text-cream/80 transition-all duration-500 ${
                    on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
                  }`}
                >
                  {item.sub}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
