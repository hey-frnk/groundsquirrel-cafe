"use client";

import { useEffect, useState } from "react";

/**
 * Picks the hero film that matches the viewport and loads only that one.
 *
 * Two <video> elements toggled with `hidden`/`sm:block` do not work here: the
 * hidden one is still fetched, because `autoplay` starts loading regardless of
 * `preload="none"` or `display: none`. So nothing is rendered on the server,
 * and after mount a single element is created with the source the screen
 * actually needs — roughly a megabyte saved on whichever variant is not shown.
 *
 * Visitors who prefer reduced motion, and anyone without JavaScript, keep the
 * poster underneath and never pay for the film at all.
 */
export default function HeroVideo({
  tallSrc,
  tallPoster,
  wideSrc,
  widePoster,
  label,
}: {
  tallSrc: string;
  tallPoster: string;
  wideSrc: string;
  widePoster: string;
  label: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [poster, setPoster] = useState<string>(widePoster);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wideScreen = window.matchMedia("(min-width: 640px)");
    const pick = () => {
      setSrc(wideScreen.matches ? wideSrc : tallSrc);
      setPoster(wideScreen.matches ? widePoster : tallPoster);
    };
    pick();
    wideScreen.addEventListener("change", pick);
    return () => wideScreen.removeEventListener("change", pick);
  }, [tallSrc, tallPoster, wideSrc, widePoster]);

  if (!src) return null;

  return (
    <video
      key={src}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
