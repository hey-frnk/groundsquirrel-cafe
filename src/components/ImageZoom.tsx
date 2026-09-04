"use client";

import { useCallback, useEffect, useState } from "react";

interface Shot {
  src: string;
  alt: string;
  caption?: string;
}

/** The caption printed under a photo, wherever this post happens to keep it. */
function captionOf(img: HTMLImageElement): string | undefined {
  const figure = img.closest("figure")?.querySelector("figcaption")?.textContent;
  if (figure) return figure;
  // A lone photo keeps its caption in the italic paragraph right below it.
  const next = img.closest("p")?.nextElementSibling;
  const italic = next?.tagName === "P" ? next.querySelector("em") : null;
  return italic && next?.textContent?.trim() === italic.textContent?.trim()
    ? (italic.textContent ?? undefined)
    : undefined;
}

/**
 * Lets a reader open any photo in a post full size.
 *
 * The photos live in HTML rendered from markdown, so they are picked up from the
 * page rather than passed in as props.
 *
 * Once open, ← and → walk the post's photos and Escape closes, so a reader can
 * look through the pictures without scrolling back and forth.
 */
export default function ImageZoom() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const images = () => [...document.querySelectorAll<HTMLImageElement>(".prose img")];
    // A post with a German version carries both, one of them hidden. Every photo
    // is made clickable — the hidden ones become visible when the language is
    // switched — but only the ones on show ever go into the list to walk through.
    const onShow = () => images().filter((img) => !img.closest("[hidden]"));

    function openImage(event: Event) {
      const visible = onShow();
      const index = visible.indexOf(event.currentTarget as HTMLImageElement);
      if (index < 0) return;
      setShots(
        visible.map((img) => ({
          src: img.currentSrc || img.src,
          alt: img.alt,
          caption: captionOf(img),
        }))
      );
      setOpen(index);
    }

    const cleanups = images().map((img) => {
      img.classList.add("is-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", img.alt ? `Enlarge: ${img.alt}` : "Enlarge photo");

      const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        openImage(e);
      };
      img.addEventListener("click", openImage);
      img.addEventListener("keydown", onKey);
      return () => {
        img.removeEventListener("click", openImage);
        img.removeEventListener("keydown", onKey);
      };
    });

    return () => cleanups.forEach((off) => off());
  }, []);

  const step = useCallback(
    (by: number) =>
      setOpen((i) => (i === null ? i : (i + by + shots.length) % shots.length)),
    [shots.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll away underneath the photo.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, step]);

  if (open === null) return null;
  const shot = shots[open];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.alt || "Photo"}
      onClick={() => setOpen(null)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/92 px-4 py-6 backdrop-blur-sm sm:px-10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shot.src}
        alt={shot.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[82vh] max-w-full cursor-zoom-out object-contain"
      />

      <div className="flex items-center gap-5 text-ivory/75">
        {shots.length > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="text-lg leading-none transition-colors duration-200 hover:text-ivory"
          >
            ←
          </button>
        )}
        <p className="max-w-xl text-center text-[0.8125rem] leading-relaxed">
          {shot.caption ?? shot.alt}
          {shots.length > 1 && (
            <span className="ml-2 text-ivory/45">
              {open + 1} / {shots.length}
            </span>
          )}
        </p>
        {shots.length > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="text-lg leading-none transition-colors duration-200 hover:text-ivory"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
