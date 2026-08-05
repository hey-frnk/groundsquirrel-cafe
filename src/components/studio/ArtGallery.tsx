"use client";

import { useCallback, useEffect, useState } from "react";

export interface ArtPlate {
  image: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * The studio's artwork, shown as small mounted plates that open into a larger
 * view.
 *
 * Every file served here is already downscaled well below print resolution (see
 * scripts/build-studio-images.sh) — that is the actual protection. The handlers
 * below only remove the two effortless ways to walk off with a painting: the
 * drag-to-desktop gesture and the right-click menu. They are friction, not a
 * lock, and deliberately stop short of breaking keyboard use or zoom.
 */
function plateGuards() {
  return {
    draggable: false,
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

function Plate({
  plate,
  className,
  priority,
}: {
  plate: ArtPlate;
  className: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={plate.image}
      alt={plate.caption ?? ""}
      width={plate.width}
      height={plate.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`art-protected ${className}`}
      {...plateGuards()}
    />
  );
}

function Lightbox({
  plates,
  index,
  onClose,
  onMove,
}: {
  plates: ArtPlate[];
  index: number;
  onClose: () => void;
  onMove: (next: number) => void;
}) {
  const plate = plates[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove((index + 1) % plates.length);
      if (e.key === "ArrowLeft") onMove((index - 1 + plates.length) % plates.length);
    };
    window.addEventListener("keydown", onKey);
    // Without this the page behind keeps scrolling under the overlay on mobile.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, plates.length, onClose, onMove]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={plate.caption ?? "Artwork"}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/85 backdrop-blur-sm p-4 sm:p-8 animate-plate-in"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full border border-cream/30 text-cream/80 hover:text-cream hover:border-cream/70 transition-colors"
      >
        ✕
      </button>

      {plates.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous artwork"
            onClick={(e) => {
              e.stopPropagation();
              onMove((index - 1 + plates.length) % plates.length);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-cream/30 text-cream/80 hover:text-cream hover:border-cream/70 transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next artwork"
            onClick={(e) => {
              e.stopPropagation();
              onMove((index + 1) % plates.length);
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-cream/30 text-cream/80 hover:text-cream hover:border-cream/70 transition-colors"
          >
            →
          </button>
        </>
      )}

      <div onClick={(e) => e.stopPropagation()} className="max-w-full">
        <Plate
          plate={plate}
          priority
          className="max-h-[78vh] max-w-full w-auto h-auto rounded-lg shadow-2xl"
        />
        {plate.caption && (
          <p className="mt-4 text-center text-sm text-cream/75">{plate.caption}</p>
        )}
      </div>
    </div>
  );
}

export default function ArtGallery({
  plates,
  layout = "masonry",
}: {
  plates: ArtPlate[];
  /**
   * `masonry` keeps every painting at its own height, `grid` evens them out,
   * and `single` centres one plate — a book cover on its own page.
   */
  layout?: "masonry" | "grid" | "single";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((next: number) => setOpen(next), []);

  if (plates.length === 0) return null;

  const frame =
    "group block w-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-4 focus-visible:ring-offset-cream rounded-xl";

  return (
    <>
      <div
        className={
          layout === "masonry"
            ? "columns-2 md:columns-3 gap-4 sm:gap-5 [column-fill:_balance]"
            : layout === "single"
              ? "mx-auto max-w-xs sm:max-w-sm"
              : "grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        }
      >
        {plates.map((plate, i) => (
          <button
            key={`${plate.image}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={plate.caption ? `Open ${plate.caption}` : "Open artwork"}
            className={`${frame} ${layout === "masonry" ? "mb-4 sm:mb-5 break-inside-avoid" : ""}`}
          >
            <span className="art-frame block overflow-hidden rounded-xl">
              <Plate
                plate={plate}
                priority={layout === "single"}
                className={`block w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                  layout === "grid" ? "aspect-[4/5] object-cover" : "h-auto"
                }`}
              />
            </span>
            {plate.caption && (
              <span className="mt-2 block text-xs leading-relaxed text-ink/60 group-hover:text-ink/85 transition-colors">
                {plate.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {open !== null && (
        <Lightbox plates={plates} index={open} onClose={close} onMove={move} />
      )}
    </>
  );
}
