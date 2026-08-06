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

/**
 * A photograph, either mounted on a card the way a print is hung (`mount`) or
 * set straight into the page with a soft frame. Both keep the same corner
 * radius so the two treatments read as one family.
 */
function Plate({
  src,
  alt,
  caption,
  ratio = "aspect-4/5",
  sizes,
  priority,
  mount = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  sizes: string;
  priority?: boolean;
  mount?: boolean;
}) {
  return (
    <figure className={mount ? "paper-card group overflow-hidden p-2.5" : "group"}>
      <div
        className={`relative overflow-hidden rounded-lg bg-ivory/25 ${
          mount ? "" : "border border-ink/10 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)]"
        } ${ratio}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      {caption && (
        <figcaption
          className={`text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60 ${
            mount ? "px-1 pt-3 pb-1 text-center" : "mt-3"
          }`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

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

        {/* An even scrim across the whole contact sheet, and a short melt into
            the page at the very bottom. A single top-to-bottom gradient washed
            the lower third out to nearly cream — which is exactly where the two
            buttons stand, and the outlined one disappeared into it. */}
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-cream" />

        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-32 text-center text-cream sm:pt-32 sm:pb-40">
          <Image
            src="/images/brand/logo_badge_var.png"
            alt=""
            width={110}
            height={160}
            className="mx-auto mb-9 w-[4.5rem] drop-shadow-lg"
          />
          {intro.kicker && <p className="eyebrow eyebrow-light">{intro.kicker}</p>}
          <h1 className="mt-6 text-4xl leading-[1.05] text-balance text-cream drop-shadow-md sm:text-6xl lg:text-7xl">
            {intro.heroHeadline}
          </h1>
          {intro.heroSubline && (
            <p className="mx-auto mt-7 max-w-xl leading-relaxed text-cream/85">
              {intro.heroSubline}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#book" className="btn btn-light">
              Book us for your event
            </a>
            <a href="#tour" className="btn btn-outline-light">
              See where we&rsquo;ve been
            </a>
          </div>
        </div>
      </section>

      {/* ---------- What this is ---------- */}
      {/* relative + z-10 so it sits above the hero's absolutely positioned overlay */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="text-pretty font-display text-2xl leading-[1.35] text-ink sm:text-[1.85rem]">
          {intro.intro}
        </p>
        <span aria-hidden className="rule mx-auto mt-10" />
      </section>

      {/* ---------- What comes with us ---------- */}
      <section className="mx-auto max-w-7xl px-6 pt-20 sm:px-10 sm:pt-28">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {OFFERINGS.map((item, i) => (
            <div key={item.title} className="reveal flex flex-col">
              <Plate
                src={item.image}
                alt={item.alt}
                sizes="(max-width: 640px) 90vw, 30vw"
                priority={i === 0}
                mount
              />
              <div className="mt-6 flex items-start gap-5">
                <span className="mt-1.5 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-xl">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-graphite/85">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Wide breath of dusk ---------- */}
      <section className="relative mt-24 sm:mt-32">
        <div className="photo-scrim relative isolate h-[22rem] sm:h-[28rem] lg:h-[32rem]">
          <Image
            src="/images/tour/band-lake.webp"
            alt="A still lake at dusk, with mountains and a treeline reflected in the water"
            fill
            sizes="100vw"
            // anchored to the bottom so the horizon and reflections survive
            // however wide the viewport gets
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 z-10 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10 sm:pb-16">
              <p className="max-w-3xl text-balance font-display text-3xl leading-[1.15] text-cream drop-shadow-md sm:text-5xl">
                Wherever we park, that&rsquo;s the café.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The tour so far ---------- */}
      <section id="tour" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-32">
        <div className="flex flex-col gap-6 border-b border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">The tour so far</p>
            <h2 className="mt-4 text-3xl sm:text-[2.6rem]">Where the café has been</h2>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {stops.map((stop) => (
              <a
                key={stop.slug}
                href={`#${stop.slug}`}
                className="link-underline text-[0.7rem] uppercase tracking-[0.18em] text-graphite/80 transition-colors hover:text-ink"
              >
                {stop.country}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-24 sm:gap-32">
          {stops.map((stop, index) => {
            const photos: TourPhoto[] = stop.photos ?? [];
            const stripCols =
              photos.length >= 3 ? "grid-cols-3" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1";

            return (
              <article
                key={stop.slug}
                id={stop.slug}
                className="grid scroll-mt-28 items-start gap-10 lg:grid-cols-2 lg:gap-16"
              >
                {/* Story */}
                <div className={`lg:sticky lg:top-28 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <p className="font-stamp text-[0.7rem] tracking-[0.2em] text-ink/45">
                    {String(stop.order).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-4xl leading-none sm:text-5xl">{stop.country}</h3>
                  {stop.place && (
                    <p className="mt-4 text-[0.7rem] uppercase tracking-[0.22em] text-graphite/65">
                      {stop.place}
                    </p>
                  )}

                  {stop.tagline && (
                    <p className="mt-8 max-w-lg font-display text-xl leading-snug text-ink sm:text-2xl">
                      {stop.tagline}
                    </p>
                  )}

                  <p className="mt-5 max-w-lg leading-relaxed text-graphite">{stop.description}</p>

                  {stop.treat && (
                    <p className="mt-8 border-t border-ink/10 pt-5 text-sm">
                      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-graphite/60">
                        On the counter
                      </span>
                      <span className="mt-1.5 block text-ink">{stop.treat}</span>
                    </p>
                  )}
                </div>

                {/* Photos */}
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Plate
                    src={stop.photo}
                    alt={`The Ground Squirrel Café in ${stop.country}`}
                    ratio="aspect-4/5"
                    sizes="(max-width: 1024px) 92vw, 46vw"
                  />
                  {photos.length > 0 && (
                    <div className={`mt-4 grid gap-4 ${stripCols}`}>
                      {photos.slice(0, 3).map((photo) => (
                        <Plate
                          key={photo.image}
                          src={photo.image}
                          alt={photo.caption ?? `The Ground Squirrel Café in ${stop.country}`}
                          caption={photo.caption}
                          ratio="aspect-square"
                          sizes="(max-width: 1024px) 30vw, 15vw"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[0.75fr_1fr] lg:gap-20">
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <Plate
              src="/images/tour/cta-1.webp"
              alt="A guest smiling over a bowl and a cinnamon bun at a forest table"
              caption="the moment we do it all for"
              sizes="(max-width: 1024px) 80vw, 32vw"
              mount
            />
          </div>

          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-5 text-3xl sm:text-[2.6rem]">And at your event?</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-graphite">
              It&rsquo;s wonderfully uncomplicated. Three steps and there&rsquo;s a café where
              there wasn&rsquo;t one before.
            </p>

            <ol className="mt-12 border-t border-ink/10">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-6 border-b border-ink/10 py-6">
                  <span className="mt-1 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg leading-tight">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-graphite/85">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Book us ---------- */}
      <section id="book" className="mt-24 scroll-mt-24 sm:mt-36">
        <div className="wash-warm border-y border-ink/10">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_1fr]">
            <div className="px-6 py-20 sm:px-10 sm:py-28">
              <p className="eyebrow">Bookings</p>
              <h2 className="mt-5 max-w-lg text-balance text-3xl leading-[1.08] sm:text-[2.75rem]">
                {intro.ctaHeading}
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-graphite">{intro.ctaText}</p>

              <ul className="mt-9 flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <li
                    key={type}
                    className="rounded-full border border-ink/15 bg-cream/50 px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.14em] text-graphite/80"
                  >
                    {type}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <a
                  href={`mailto:${intro.ctaEmail}?subject=${encodeURIComponent(
                    "The Ground Squirrel Café at our event"
                  )}`}
                  className="btn btn-primary"
                >
                  Let&rsquo;s plan your day
                </a>
              </div>
              <p className="mt-5 text-sm text-graphite/80">
                or write to{" "}
                <a
                  href={`mailto:${intro.ctaEmail}`}
                  className="link-underline text-ink"
                >
                  {intro.ctaEmail}
                </a>
              </p>
            </div>

            <div className="relative min-h-[18rem] lg:min-h-full">
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
