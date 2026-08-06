import {
  Alegreya,
  Bricolage_Grotesque,
  DM_Serif_Display,
  EB_Garamond,
  Fraunces,
  Instrument_Serif,
  Lora,
  Newsreader,
  Petrona,
  Spectral,
} from "next/font/google";

/**
 * A scratch page for choosing the display face — every candidate set in the
 * real headline, the real section head and the real card title, on the real
 * background. Delete this route once the decision is made.
 */
export const metadata = {
  title: "Font candidates",
  robots: { index: false, follow: false },
};

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], display: "swap" });
const lora = Lora({ subsets: ["latin"], display: "swap" });
const alegreya = Alegreya({ subsets: ["latin"], display: "swap" });
const petrona = Petrona({ subsets: ["latin"], display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], display: "swap" });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });

const CANDIDATES = [
  {
    n: 1,
    name: "Fraunces",
    note: "Was jetzt drauf ist — modern, kontrastreich, etwas kühl.",
    cls: fraunces.className,
    tracking: "-0.03em",
  },
  {
    n: 2,
    name: "Newsreader",
    note: "Literarisch und weich. Wie ein gut gesetztes Magazin.",
    cls: newsreader.className,
    tracking: "-0.02em",
  },
  {
    n: 3,
    name: "Lora",
    note: "Freundliche Buchschrift mit leicht kalligrafischem Zug.",
    cls: lora.className,
    tracking: "-0.02em",
  },
  {
    n: 4,
    name: "Alegreya",
    note: "Humanistisch, warm, ein bisschen handgeschnitten.",
    cls: alegreya.className,
    tracking: "-0.015em",
  },
  {
    n: 5,
    name: "Petrona",
    note: "Rustikaler, erdiger — am nächsten am Granola-Gefühl.",
    cls: petrona.className,
    tracking: "-0.02em",
  },
  {
    n: 6,
    name: "Spectral",
    note: "Ruhig und sachlich. Die zurückhaltendste der Auswahl.",
    cls: spectral.className,
    tracking: "-0.02em",
  },
  {
    n: 7,
    name: "EB Garamond",
    note: "Klassische Renaissance-Antiqua. Zeitlos, leise.",
    cls: garamond.className,
    tracking: "-0.01em",
  },
  {
    n: 8,
    name: "DM Serif Display",
    note: "Weiche Rundungen, hoher Kontrast. Einladend.",
    cls: dmSerif.className,
    tracking: "-0.02em",
  },
  {
    n: 9,
    name: "Instrument Serif",
    note: "Schmal und elegant. Sehr grosse Headlines.",
    cls: instrument.className,
    tracking: "-0.01em",
  },
  {
    n: 10,
    name: "Bricolage Grotesque",
    note: "Keine Serifen — eigenwillig, warm, sehr heutig.",
    cls: bricolage.className,
    tracking: "-0.03em",
  },
];

export default function FontsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">Zur Auswahl</p>
      <h1 className="mt-4 text-4xl">Zehn Titelschriften</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-graphite">
        Jede Kandidatin im echten Einsatz: Hero-Headline, Abschnitts-Überschrift und
        Kartentitel, auf dem echten Papier. Der Fliesstext bleibt überall Inter.
      </p>

      <div className="mt-16 space-y-16">
        {CANDIDATES.map((c) => (
          <section key={c.name} className="border-t border-ink/15 pt-8">
            <div className="flex items-baseline gap-4">
              <span className="font-stamp text-[0.7rem] tracking-[0.2em] text-ink/45">
                {String(c.n).padStart(2, "0")}
              </span>
              <h2 className="text-lg">{c.name}</h2>
              <span className="text-sm text-graphite/80">{c.note}</span>
            </div>

            <div className={c.cls} style={{ letterSpacing: c.tracking }}>
              <p className="mt-7 text-5xl leading-[1.02] text-ink sm:text-6xl">
                Come in,
                <br />
                coffee&rsquo;s ready
              </p>
              <p className="mt-8 text-3xl text-ink sm:text-[2.6rem]">
                Where would you like to go?
              </p>
              <p className="mt-5 text-2xl text-ink">Squirrels of the World — Art Prints</p>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-graphite/85">
              Der Fliesstext bleibt Inter: ruhig, gut lesbar, unaufgeregt — damit die
              Titelschrift den ganzen Charakter tragen darf.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
