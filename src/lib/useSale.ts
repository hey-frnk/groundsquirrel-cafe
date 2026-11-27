"use client";

import { useSyncExternalStore } from "react";
import { BUILD_TIME, SALE, saleActiveAt } from "./sale";

/**
 * Whether the sale is on, by the visitor's clock.
 *
 * The static HTML was rendered at build time, so hydration starts from the
 * build's answer and then switches to the clock. A page opened on December 1
 * from a build made during the sale therefore shows regular prices without a
 * rebuild, and a page left open across midnight switches when the sale ends.
 */
export function useSaleActive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => saleActiveAt(Date.now()),
    () => saleActiveAt(BUILD_TIME)
  );
}

// setTimeout overflows past about 24.8 days and would then fire at once.
const MAX_DELAY = 2 ** 31 - 1;

function subscribe(onChange: () => void) {
  let timer = 0;
  const schedule = () => {
    window.clearTimeout(timer);
    const now = Date.now();
    const next = [SALE.starts, SALE.ends].find((t) => t > now);
    if (next === undefined) return;
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, Math.min(next - now + 50, MAX_DELAY));
  };
  // Timers drift or stop while a laptop sleeps; check again on return.
  const onVisible = () => {
    if (document.visibilityState === "visible") {
      onChange();
      schedule();
    }
  };
  schedule();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
