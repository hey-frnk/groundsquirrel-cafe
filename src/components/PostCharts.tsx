"use client";

import { useEffect, useLayoutEffect } from "react";

// Collapsing the charts has to happen before the first paint, or they are drawn
// finished and then visibly empty out before they grow.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Counts a written amount ("CHF 24'436.86", "CHF 24,436.86") up from zero. */
function countUp(el: HTMLElement, written: string, duration = 1600) {
  const match = /^([^\d]*)([\d'’,]+)(\.\d+)?(.*)$/.exec(written);
  if (!match) return () => {};
  const [, prefix, whole, fraction = "", suffix] = match;
  const separator = /['’,]/.exec(whole)?.[0] ?? "";
  const target = Number(whole.replace(/['’,]/g, "") + fraction);
  const decimals = Math.max(fraction.length - 1, 0);

  let frame = 0;
  let started = 0;
  const step = (now: number) => {
    if (!started) started = now;
    const progress = Math.min(1, (now - started) / duration);
    // The same easing as CountUp on the tour page: fast out of the gate,
    // settling gently onto the total.
    const value = target * (1 - Math.pow(1 - progress, 4));
    const [w, f] = value.toFixed(decimals).split(".");
    el.textContent =
      prefix + w.replace(/\B(?=(\d{3})+(?!\d))/g, separator) + (f ? `.${f}` : "") + suffix;
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

/**
 * Brings the `[chart:…]` figures in journal posts to life (see `renderCharts`).
 *
 * The charts arrive finished from the server, so they read correctly with no
 * JavaScript and for anyone who asked for reduced motion. Here they are emptied
 * before the first paint and grow once they scroll into view, in step with the
 * figures on the tour page. A donut also answers hover and keyboard focus: the
 * slice and its legend row light up together and the middle of the ring shows
 * that slice's amount in place of the total.
 */
export default function PostCharts() {
  useIsomorphicLayoutEffect(() => {
    const charts = Array.from(document.querySelectorAll<HTMLElement>("[data-chart]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    for (const chart of charts) {
      const value = chart.querySelector<HTMLElement>(".post-donut-value");
      const label = chart.querySelector<HTMLElement>(".post-donut-label");
      const rows = Array.from(chart.querySelectorAll<HTMLElement>(".post-legend li"));
      let counting = false;

      const show = (slice: string | null) => {
        if (counting || !value || !label) return;
        const row = rows.find((r) => r.dataset.slice === slice);
        if (row) chart.dataset.active = slice!;
        else delete chart.dataset.active;
        chart.querySelectorAll<Element>("[data-slice]").forEach((el) => {
          el.classList.toggle("is-active", (el as HTMLElement).dataset.slice === slice);
        });
        value.textContent = row?.dataset.shown ?? value.dataset.total ?? "";
        label.textContent = row?.dataset.label ?? label.dataset.totalLabel ?? "";
      };
      const onEnter = (e: Event) => {
        const slice = (e.target as Element).closest<HTMLElement>("[data-slice]")?.dataset.slice;
        if (slice !== undefined) show(slice);
      };
      const onLeave = () => show(null);
      chart.addEventListener("pointerover", onEnter);
      chart.addEventListener("focusin", onEnter);
      chart.addEventListener("pointerleave", onLeave);
      chart.addEventListener("focusout", onLeave);
      cleanups.push(() => {
        chart.removeEventListener("pointerover", onEnter);
        chart.removeEventListener("focusin", onEnter);
        chart.removeEventListener("pointerleave", onLeave);
        chart.removeEventListener("focusout", onLeave);
      });

      if (reduced) continue;
      chart.dataset.waiting = "";
      if (value?.dataset.total) {
        value.textContent = value.dataset.total.replace(
          /[\d'’,]+(\.\d+)?/,
          (_m, fraction?: string) => "0" + (fraction ? "." + "0".repeat(fraction.length - 1) : "")
        );
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          delete chart.dataset.waiting;
          if (value?.dataset.total) {
            counting = true;
            const stop = countUp(value, value.dataset.total);
            const done = window.setTimeout(() => (counting = false), 1600);
            cleanups.push(stop, () => window.clearTimeout(done));
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(chart);
      cleanups.push(() => observer.disconnect());
    }

    return () => cleanups.forEach((off) => off());
  }, []);

  return null;
}
