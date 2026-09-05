"use client";

import { useEffect } from "react";

/**
 * Two-click ("Shariff") loading for the Google My Maps embeds in journal posts.
 *
 * The maps live in the markdown as `[map:MID|Caption]` and are rendered by
 * `renderMapEmbeds` as an inert placeholder — no iframe, no request to Google —
 * so a reader who never asks for the map never contacts Google at all. This
 * component only wires the button: on click the placeholder is swapped for the
 * real iframe, for that one map, for that one page view. Nothing is
 * remembered, so no consent has to be stored and no cookie banner is needed.
 */
export default function MapEmbeds() {
  useEffect(() => {
    const placeholders = document.querySelectorAll<HTMLElement>("[data-map-embed]");

    const cleanups = Array.from(placeholders).map((figure) => {
      const button = figure.querySelector<HTMLButtonElement>("[data-map-load]");
      const frame = figure.querySelector<HTMLElement>("[data-map-frame]");
      const mid = figure.dataset.mapEmbed;
      if (!button || !frame || !mid) return () => {};

      function load() {
        const iframe = document.createElement("iframe");
        // `ehbc` is the Google My Maps background color parameter from the
        // original embed code; `mid` identifies the map itself.
        iframe.src = `https://www.google.com/maps/d/u/0/embed?mid=${encodeURIComponent(mid!)}&ehbc=2E312F`;
        iframe.title = button!.dataset.mapTitle || "Interactive map";
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer";
        iframe.allowFullscreen = true;
        frame!.replaceChildren(iframe);
        figure.dataset.mapLoaded = "true";
      }

      button.addEventListener("click", load);
      return () => button.removeEventListener("click", load);
    });

    return () => cleanups.forEach((off) => off());
  }, []);

  return null;
}
