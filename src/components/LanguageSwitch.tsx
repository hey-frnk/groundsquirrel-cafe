"use client";

import { useEffect, useState } from "react";
import { ChFlag, UsFlag } from "@/components/icons";

type Lang = "en" | "de";

const LANGUAGES = [
  { code: "en" as const, label: "English", Icon: UsFlag },
  { code: "de" as const, label: "Deutsch", Icon: ChFlag },
];

/**
 * A post that exists in both languages carries both versions in its HTML, each
 * piece marked `data-lang`; these two flags decide which of them is on show.
 * The switch works on the page that is already there — no route, no reload — and
 * nothing is remembered between visits, which keeps the site's promise that the
 * only thing it stores in your browser is the basket.
 *
 * English is the default, because every post is written in it and only some also
 * have a German version.
 */
export default function LanguageSwitch() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>("[data-lang]")) {
      el.hidden = el.dataset.lang !== lang;
    }
  }, [lang]);

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {LANGUAGES.map(({ code, label, Icon }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          lang={code}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] transition-colors duration-200",
            lang === code
              ? "border-ink/35 bg-ink/8 text-ink"
              : "border-ink/12 bg-ivory/25 text-graphite/65 hover:border-ink/25 hover:text-ink",
          ].join(" ")}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  );
}
