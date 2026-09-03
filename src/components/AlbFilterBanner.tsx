"use client";

import { useEffect, useState } from "react";

/**
 * Machbarkeitsstudie: the discount code from the Alb Filter collaboration,
 * offered once, from the side.
 *
 * It is deliberately not a modal — nothing is covered, nothing has to be
 * dismissed before the page can be read. It slides in from the right a moment
 * after the page has settled, and once it has been closed (or the code copied)
 * it never comes back on this browser.
 */
const STORAGE_KEY = "gsc.albfilter-code.seen";
const CODE = "weltenhummler";
const SHOP_URL = "https://alb-filter.com";

/** Long enough that it arrives after the page, short enough to still be seen. */
const DELAY_MS = 2600;

export default function AlbFilterBanner() {
  // Rendered only once the timer has fired, so the markup does not exist for
  // anyone who has seen it before.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // A browser with site data blocked throws on read; that is a reason to show
    // the banner, not to break the page.
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* no storage — treat it as a first visit */
    }

    // Mounted off-screen first and moved a tick later, so the browser has a
    // painted starting point to transition from. A timer rather than a frame
    // callback: in a background tab frames stop entirely, and the banner would
    // then be mounted but stuck off the edge of the page.
    let slide = 0;
    const appear = window.setTimeout(() => {
      setMounted(true);
      slide = window.setTimeout(() => setShown(true), 40);
    }, DELAY_MS);

    return () => {
      window.clearTimeout(appear);
      window.clearTimeout(slide);
    };
  }, []);

  function dismiss() {
    setShown(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* nothing to remember it with; it will show again next time */
    }
    // Unmounted only after the slide-out has finished.
    window.setTimeout(() => setMounted(false), 500);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
    } catch {
      // Clipboard denied or unavailable — the code is written out in full
      // right next to the button, so there is nothing to recover from.
    }
  }

  if (!mounted) return null;

  return (
    <aside
      role="complementary"
      aria-label="Discount code for Alb Filter"
      className={`fixed bottom-5 right-0 z-40 w-[min(22rem,calc(100vw-1.5rem))] transition-transform duration-500 ease-out motion-reduce:transition-none sm:bottom-8 ${
        shown ? "translate-x-0" : "translate-x-[110%]"
      }`}
    >
      <div className="mr-3 rounded-l-lg rounded-r-lg border border-ink/10 bg-paper px-5 py-5 shadow-[0_18px_44px_-26px_rgba(74,66,53,0.9)] sm:mr-6">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="float-right -mr-1 -mt-1 text-lg leading-none text-graphite/50 transition-colors hover:text-ink"
        >
          &times;
        </button>

        <p className="font-stamp text-[0.65rem] uppercase tracking-[0.18em] text-graphite/70">
          From our collaboration
        </p>
        <p className="mt-3 leading-relaxed text-graphite">
          The water our coffee is made of comes through an Alb Filter. With our code you get{" "}
          <span className="text-ink">5% off</span> your order at alb-filter.com.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copy}
            className="rounded-md border border-dashed border-ink/30 bg-blush/40 px-3 py-1.5 font-stamp text-[0.8rem] tracking-[0.08em] text-ink transition-colors hover:border-rose"
          >
            {CODE}
          </button>
          <span
            aria-live="polite"
            className="text-[0.7rem] uppercase tracking-[0.14em] text-graphite/60"
          >
            {copied ? "Copied" : "Tap to copy"}
          </span>
        </div>

        <a
          href={`${SHOP_URL}/weltenhummler`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="link-arrow mt-5"
        >
          To the shop
          <span data-arrow aria-hidden>
            →
          </span>
        </a>
      </div>
    </aside>
  );
}
