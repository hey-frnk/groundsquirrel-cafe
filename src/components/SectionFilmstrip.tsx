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
      className="filmstrip -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 sm:-mx-10 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className="group relative w-[70vw] shrink-0 snap-center overflow-hidden rounded-xl border border-ink/10 bg-ink shadow-[0_18px_40px_-30px_rgba(74,66,53,0.95)] sm:w-[42vw] lg:w-auto"
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
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 42vw, 20vw"
              className="object-cover"
            />

            {loaded.has(i) && (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  active === i ? "opacity-100" : "opacity-0"
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

            {/* Deep enough at the foot to hold the lettering, and a light veil
                over the whole panel that lifts when the panel is the one being
                watched. */}
            <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/15 to-ink/10" />
            <div
              className={`absolute inset-0 bg-ink/25 transition-opacity duration-500 ${
                active === i ? "opacity-0" : "opacity-100"
              }`}
            />

            <span className="absolute left-5 top-5 font-stamp text-[0.7rem] tracking-[0.18em] text-cream/70">
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-display text-[1.6rem] leading-none text-cream">{item.label}</h3>
              <p className="mt-2.5 text-[0.82rem] leading-snug text-cream/75">{item.sub}</p>

              {/* The whole panel is the link; this is what it looks like, so it
                  must not be a button of its own inside one. */}
              <span
                aria-hidden
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-cream/45 px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream transition-colors duration-300 group-hover:border-rose group-hover:bg-rose group-hover:text-ink"
              >
                Enter
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h13M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
