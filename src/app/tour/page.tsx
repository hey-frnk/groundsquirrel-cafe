import Image from "next/image";
import { getAllTourStops, getPage, type TourPhoto } from "@/lib/content";

interface TourIntro {
  title: string;
  kicker?: string;
  heroHeadline: string;
  heroSubline?: string;
  intro: string;
  ctaHeading: string;
  ctaText: string;
  ctaEmail: string;
}

export const metadata = {
  title: "Tour — The Ground Squirrel Café",
  description:
    "A café on wheels: Humbär, our self-built 1992 VW camper, brings coffee, tea and homemade cake to your event.",
};

const HERO_PHOTOS = [
  { src: "/images/tour/hero-1.webp", alt: "Cake carried out into the evening light on Furka Pass" },
  { src: "/images/tour/hero-2.webp", alt: "A tray of freshly baked bagels below a Norwegian mountain" },
  { src: "/images/tour/hero-3.webp", alt: "Humbär with his hatch open and the OPEN sign out" },
  { src: "/images/tour/hero-4.webp", alt: "Coffee and cake served by the Greek sea" },
  { src: "/images/tour/hero-5.webp", alt: "A table for two beside the camper in a Swedish forest" },
];

const OFFERINGS = [
  {
    title: "Humbär, the café",
    image: "/images/tour/card-humbaer.webp",
    alt: "Humbär parked at the forest edge with his café hatch open",
    text: "A 1992 VW camper, born in Schaffhausen, rebuilt by hand into a solar-powered café. He parks almost anywhere and folds open into a counter.",
  },
  {
    title: "Baked from scratch",
    image: "/images/tour/card-bakes.webp",
    alt: "A long table set with homemade buns and plates",
    text: "Heartwarming local baked goods, made for the place we're in — an Engadin walnut cake in the Alps, a strawberry cake in the forest.",
  },
  {
    title: "Coffee & tea, poured by hand",
    image: "/images/tour/card-coffee.webp",
    alt: "The espresso machine and a tray of pastries inside the camper",
    text: "Proper espresso from the little Zurich-made machine on board, pots of tea, and a heart in the milk foam.",
  },
];

const STEPS = [
  {
    title: "Say hello",
    text: "Write us a few lines about your day: where, roughly when, and how many people you're expecting.",
  },
  {
    title: "We plan the menu together",
    text: "We bake to the season and the place — tell us your favourites and anything your guests can't eat.",
  },
  {
    title: "Humbär rolls in",
    text: "We arrive early, fold open the hatch, and the coffee starts flowing.",
  },
];

const EVENT_TYPES = [
  "Weddings",
  "Markets",
  "Festivals",
  "Company gatherings",
  "Birthdays",
  "Workshops",
  "Film sets",
  "Just because",
];

function Polaroid({
  src,
  alt,
  caption,
  tilt,
  square = false,
  sizes,
}: {
  src: string;
  alt: string;
  caption?: string;
  tilt: string;
  square?: boolean;
  sizes: string;
}) {
  return (
    <figure
      className={`${tilt} group bg-white p-2 pb-2 shadow-[0_6px_20px_-8px_rgba(74,66,53,0.45)] rounded-[3px] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]`}
    >
      <div className={`relative ${square ? "aspect-square" : "aspect-4/5"} overflow-hidden bg-ivory/50`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
      {caption && (
        <figcaption className="px-1 pt-2 pb-1 text-center text-[0.6rem] sm:text-[0.7rem] leading-snug text-ink/60">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Dashed road between two tour chapters, with a little paw print on it. */
function RouteDivider() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-2 py-10 sm:py-14">
      <div className="h-14 w-px border-l-2 border-dashed border-ink/25" />
      <span className="text-lg opacity-60">🐿️</span>
      <div className="h-14 w-px border-l-2 border-dashed border-ink/25" />
    </div>
  );
}

const SMALL_TILTS = ["-rotate-2", "rotate-1", "-rotate-1"];

export default function TourPage() {
  const intro = getPage<TourIntro>("tour-intro");
  const stops = getAllTourStops();

  return (
    <div>
      {/* ---------- Hero: a contact sheet of the road ---------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {HERO_PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              // 2 photos on phones, 3 on tablets, all 5 on desktop
              className={`relative ${i === 2 ? "hidden sm:block" : ""} ${i > 2 ? "hidden lg:block" : ""}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
                preload={i < 2}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/40 via-ink/10 to-cream" />

        <div className="relative mx-auto max-w-3xl px-5 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center text-cream">
          <Image
            src="/images/brand/logo_badge_var.png"
            alt=""
            width={110}
            height={160}
            className="mx-auto mb-7 drop-shadow-lg"
          />
          {intro.kicker && (
            <p className="mb-4 text-[0.7rem] sm:text-xs uppercase tracking-[0.3em] text-cream/80">
              {intro.kicker}
            </p>
          )}
          <h1 className="text-4xl sm:text-6xl leading-tight drop-shadow-md">{intro.heroHeadline}</h1>
          {intro.heroSubline && (
            <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-cream/90">
              {intro.heroSubline}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#book"
              className="rounded-full bg-rose px-7 py-3 text-ink shadow-lg transition-colors hover:bg-cream"
            >
              Book us for your event
            </a>
            <a
              href="#tour"
              className="rounded-full border border-cream/60 px-7 py-3 text-cream transition-colors hover:bg-cream/15"
            >
              See where we&rsquo;ve been
            </a>
          </div>
        </div>
      </section>

      {/* ---------- What this is ---------- */}
      {/* relative + z-10 so it sits above the hero's absolutely positioned overlay */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 -mt-4 text-center">
        <p className="text-lg sm:text-2xl leading-relaxed">{intro.intro}</p>
        <div className="mt-8 flex items-center justify-center gap-3 text-ink/30">
          <span className="h-px w-16 bg-current" />
          <span className="text-sm">☕</span>
          <span className="h-px w-16 bg-current" />
        </div>
      </section>

      {/* ---------- What comes with us ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-20">
        <div className="grid gap-8 sm:gap-6 sm:grid-cols-3">
          {OFFERINGS.map((item, i) => (
            <div key={item.title} className="flex flex-col">
              <Polaroid
                src={item.image}
                alt={item.alt}
                tilt={SMALL_TILTS[i % SMALL_TILTS.length]}
                sizes="(max-width: 640px) 90vw, 30vw"
              />
              <h2 className="mt-6 text-xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Wide breath of dusk ---------- */}
      <section className="relative mt-16 sm:mt-24">
        <div className="relative h-60 sm:h-80 lg:h-96">
          <Image
            src="/images/tour/band-lake.webp"
            alt="A still lake at dusk, with mountains and a treeline reflected in the water"
            fill
            sizes="100vw"
            // anchored to the bottom so the horizon and reflections survive
            // however wide the viewport gets
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-ink/30" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="max-w-2xl text-center text-xl sm:text-3xl leading-snug text-cream drop-shadow-md">
              Wherever we park, that&rsquo;s the café.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- The tour so far ---------- */}
      <section id="tour" className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24 scroll-mt-20">
        <div className="text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/50">The tour so far</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Where the café has been</h2>
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-ink/70">
            {stops.map((stop, i) => (
              <span key={stop.slug} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink/25">·</span>}
                <a href={`#${stop.slug}`} className="transition-colors hover:text-rose">
                  {stop.country}
                </a>
              </span>
            ))}
          </nav>
        </div>

        <div className="mt-12 sm:mt-16">
          {stops.map((stop, index) => {
            const photos: TourPhoto[] = stop.photos ?? [];
            const stripCols =
              photos.length >= 3 ? "grid-cols-3" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1";

            return (
              <div key={stop.slug}>
                {index > 0 && <RouteDivider />}

                <article
                  id={stop.slug}
                  className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 scroll-mt-24"
                >
                  {/* Story */}
                  <div
                    className={`lg:sticky lg:top-28 ${index % 2 === 1 ? "lg:order-2" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-rose text-sm text-ink/70">
                        {String(stop.order).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-3xl sm:text-4xl leading-none">{stop.country}</h3>
                        {stop.place && (
                          <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-ink/55">
                            {stop.place}
                          </p>
                        )}
                      </div>
                    </div>

                    {stop.tagline && (
                      <p className="mt-6 text-xl sm:text-2xl leading-snug text-ink/90">
                        {stop.tagline}
                      </p>
                    )}

                    <p className="mt-4 leading-relaxed text-ink/75">{stop.description}</p>

                    {stop.treat && (
                      <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-ivory/70 px-4 py-2 text-sm">
                        <span aria-hidden>🍰</span>
                        <span className="text-ink/50">On the counter:</span>
                        <span>{stop.treat}</span>
                      </p>
                    )}
                  </div>

                  {/* Photos */}
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <Polaroid
                      src={stop.photo}
                      alt={`The Ground Squirrel Café in ${stop.country}`}
                      tilt={index % 2 === 1 ? "rotate-1" : "-rotate-1"}
                      sizes="(max-width: 1024px) 92vw, 46vw"
                    />
                    {photos.length > 0 && (
                      <div className={`mt-6 grid gap-3 sm:gap-4 ${stripCols}`}>
                        {photos.slice(0, 3).map((photo, i) => (
                          <Polaroid
                            key={photo.image}
                            src={photo.image}
                            alt={photo.caption ?? `The Ground Squirrel Café in ${stop.country}`}
                            caption={photo.caption}
                            square
                            tilt={SMALL_TILTS[i % SMALL_TILTS.length]}
                            sizes="(max-width: 1024px) 30vw, 15vw"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-20 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <div className="mx-auto w-full max-w-xs lg:max-w-none">
            <Polaroid
              src="/images/tour/cta-1.webp"
              alt="A guest smiling over a bowl and a cinnamon bun at a forest table"
              caption="the moment we do it all for"
              tilt="-rotate-2"
              sizes="(max-width: 1024px) 80vw, 32vw"
            />
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl">And at your event?</h2>
            <p className="mt-4 max-w-xl text-ink/75">
              It&rsquo;s wonderfully uncomplicated. Three steps and there&rsquo;s a café where there
              wasn&rsquo;t one before.
            </p>

            <ol className="mt-10 space-y-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilac text-sm text-ink shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg leading-tight">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Book us ---------- */}
      <section id="book" className="mx-auto max-w-6xl px-5 pt-20 sm:pt-28 pb-4 scroll-mt-20">
        <div className="overflow-hidden rounded-3xl border border-rose bg-rose/40">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="px-6 py-10 sm:px-12 sm:py-14">
              <h2 className="text-3xl sm:text-4xl leading-tight">{intro.ctaHeading}</h2>
              <p className="mt-5 leading-relaxed text-ink/80">{intro.ctaText}</p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <li
                    key={type}
                    className="rounded-full border border-ink/15 bg-cream/60 px-3.5 py-1.5 text-xs"
                  >
                    {type}
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:${intro.ctaEmail}?subject=${encodeURIComponent(
                  "The Ground Squirrel Café at our event"
                )}`}
                className="mt-9 inline-block rounded-full bg-ink px-8 py-3.5 text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Let&rsquo;s plan your day →
              </a>
              <p className="mt-4 text-sm text-ink/60">
                or write to{" "}
                <a href={`mailto:${intro.ctaEmail}`} className="underline decoration-ink/30 underline-offset-4">
                  {intro.ctaEmail}
                </a>
              </p>
            </div>

            <div className="relative min-h-64 lg:min-h-full">
              <Image
                src="/images/tour/cta-2.webp"
                alt="Humbär parked in the forest with the café hatch open and coffee being carried out"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
