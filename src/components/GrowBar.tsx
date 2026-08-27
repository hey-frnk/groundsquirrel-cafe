"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Collapsing the bar has to happen before the first paint, or it is drawn full
// and then visibly shrinks before it grows.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The country bars fill in as the panel comes into view, in step with the
 * figures above them counting up. Without JavaScript — or with reduced motion
 * asked for — they are simply drawn at their final width.
 */
export default function GrowBar({ width, delay = 0 }: { width: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [grown, setGrown] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setGrown(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setGrown(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
      <span
        className="block h-full rounded-full bg-rose transition-[width] duration-[1600ms] ease-out"
        style={{ width: grown ? `${width}%` : 0, transitionDelay: `${delay}ms` }}
      />
    </span>
  );
}
