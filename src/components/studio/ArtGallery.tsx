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
      className="animate-plate-in fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/92 p-4 backdrop-blur-sm sm:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center border border-cream/25 text-cream/75 transition-colors hover:border-cream/70 hover:text-cream"
      >
        <svg aria-hidden width="15" height="15" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 2l12 12M14 2L2 14" />
        </svg>
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
            className="absolute top-1/2 left-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-cream/25 text-cream/75 transition-colors hover:border-cream/70 hover:text-cream sm:left-6"
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
            className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-cream/25 text-cream/75 transition-colors hover:border-cream/70 hover:text-cream sm:right-6"
          >
            →
          </button>
        </>
      )}

      <div onClick={(e) => e.stopPropagation()} className="max-w-full">
        <Plate
          plate={plate}
          priority
          className="h-auto max-h-[78vh] w-auto max-w-full shadow-2xl"
        />
        {plate.caption && (
          <p className="mt-5 text-center text-[0.7rem] uppercase tracking-[0.18em] text-cream/70">
            {plate.caption}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * One large plate with the rest as small thumbnails underneath, like a product
 * page in the shop: a thumbnail swaps the large plate, and the large plate opens
 * into the full view.
 */
function Showcase({ plates, onOpen }: { plates: ArtPlate[]; onOpen: (i: number) => void }) {
  const [active, setActive] = useState(0);
  const plate = plates[active];

  return (
    <div className="mx-auto max-w-md">
      <button
        type="button"
        onClick={() => onOpen(active)}
        aria-label={plate.caption ? `Open ${plate.caption}` : "Open photo"}
        className="group block w-full cursor-zoom-in focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
      >
        <span className="art-frame block overflow-hidden p-2">
          <Plate
            key={plate.image}
            plate={plate}
            priority
            className="animate-plate-in block aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </span>
      </button>

      {plates.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {plates.map((p, i) => (
            <button
              key={`${p.image}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={`h-16 w-16 overflow-hidden rounded-lg bg-ivory/25 transition-all sm:h-20 sm:w-20 ${
                i === active
                  ? "outline outline-1 outline-offset-[3px] outline-rose"
                  : "opacity-65 outline outline-1 outline-ink/10 hover:opacity-100"
              }`}
            >
              <Plate plate={{ image: p.image }} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
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
   * `single` centers one plate — a book cover on its own page — and
   * `showcase` sets one large with the rest as thumbnails to pick from.
   */
  layout?: "masonry" | "grid" | "single" | "showcase";
}) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((next: number) => setOpen(next), []);

  if (plates.length === 0) return null;

  const frame =
    "group block w-full cursor-zoom-in text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose";

  const lightbox = open !== null && (
    <Lightbox plates={plates} index={open} onClose={close} onMove={move} />
  );

  if (layout === "showcase") {
    return (
      <>
        <Showcase plates={plates} onOpen={setOpen} />
        {lightbox}
      </>
    );
  }

  return (
    <>
      <div
        className={
          layout === "masonry"
            ? "columns-2 gap-5 sm:gap-7 md:columns-3 [column-fill:_balance]"
            : layout === "single"
              ? "mx-auto max-w-xs sm:max-w-sm"
              : "grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3"
        }
      >
        {plates.map((plate, i) => (
          <button
            key={`${plate.image}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={plate.caption ? `Open ${plate.caption}` : "Open artwork"}
            className={`${frame} ${layout === "masonry" ? "mb-5 break-inside-avoid sm:mb-7" : ""}`}
          >
            <span className="art-frame block overflow-hidden p-2">
              <Plate
                plate={plate}
                priority={layout === "single"}
                className={`block w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                  layout === "grid" ? "aspect-[4/5] object-cover" : "h-auto"
                }`}
              />
            </span>
            {plate.caption && (
              <span className="mt-3 block text-[0.78rem] leading-relaxed tracking-[0.01em] text-graphite/70 transition-colors group-hover:text-ink">
                {plate.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightbox}
    </>
  );
}
