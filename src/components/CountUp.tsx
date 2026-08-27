"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * The figures are written in the CMS the way they should finally read —
 * "470'500", "+89%", "198×", "8.3%" — so the animation has to take a formatted
 * string apart and put it back together on every frame: any leading sign, the
 * number itself, and whatever trails it. Anything that isn't a number (a date,
 * a placeholder) simply renders as it is.
 */
interface Parsed {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  /** The Swiss thousands separator as it was typed, or "" if there was none. */
  separator: string;
}

function parse(value: string): Parsed | null {
  const match = /^([^\d]*)(\d[\d'’]*(?:[.,]\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix, body, suffix] = match;
  const plain = body.replace(/['’]/g, "").replace(",", ".");
  const target = Number(plain);
  if (!Number.isFinite(target)) return null;
  return {
    prefix,
    suffix,
    target,
    decimals: plain.includes(".") ? plain.split(".")[1].length : 0,
    separator: /['’]/.exec(body)?.[0] ?? "",
  };
}

function format(n: number, p: Parsed) {
  const fixed = n.toFixed(p.decimals);
  const [whole, fraction] = fixed.split(".");
  const grouped = p.separator
    ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, p.separator)
    : whole;
  return p.prefix + grouped + (fraction ? `.${fraction}` : "") + p.suffix;
}

// The zeroing has to happen before the browser paints, or the figure shows its
// final value for a frame and then snaps back to nothing.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function CountUp({
  value,
  className,
  duration = 1600,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Server-rendered as the finished figure, so the page is right with no
  // JavaScript at all and search engines read the real numbers.
  const [display, setDisplay] = useState(value);

  useIsomorphicLayoutEffect(() => {
    const parsed = parse(value);
    const el = ref.current;
    if (!parsed || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setDisplay(format(0, parsed));

    let frame = 0;
    let started = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const step = (now: number) => {
          if (!started) started = now;
          const progress = Math.min(1, (now - started) / duration);
          // Fast out of the gate and settling gently, the way a counter
          // reaching its total should feel.
          const eased = 1 - Math.pow(1 - progress, 4);
          setDisplay(format(parsed.target * eased, parsed));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}
