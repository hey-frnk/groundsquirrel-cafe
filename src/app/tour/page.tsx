import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";
import CountUp from "@/components/CountUp";
import GrowBar from "@/components/GrowBar";
import { InstagramIcon } from "@/components/icons";
import { getAllCollabs, getAllTourStops, getPage, measureImage, type TourPhoto } from "@/lib/content";
import { splitLines } from "@/lib/text";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, collaborationService } from "@/lib/seo";

interface Pillar {
  title: string;
  text: string;
}

interface ReachItem {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}

interface AudienceFact {
  value: string;
  label: string;
}

interface AudienceItem {
  label: string;
  percent: number;
}

interface TourIntro {
  title: string;
  heroHeadline: string;
  intro: string;
  collabKicker: string;
  collabHeading: string;
  pillars?: Pillar[];
  casesKicker: string;
  casesHeading: string;
  reachHeading: string;
  reachNote?: string;
  reach?: ReachItem[];
  audienceHeading?: string;
  audience?: AudienceItem[];
  audienceFacts?: AudienceFact[];
  stepsHeading: string;
  stepsNote?: string;
  bookingHeading: string;
  bookingText: string;
  ctaHeading: string;
  ctaText: string;
  ctaEmail: string;
}

export const metadata = {
  // Written for the search that brings a brand here — "vanlife content
  // creator", "UGC Schweiz", "brand collaboration camper" — rather than for the
  // one that brings a neighbour looking for a coffee.
  title: { absolute: "Brand collaborations & UGC — The Ground Squirrel Café on tour" },
  alternates: { canonical: "/tour/" },
  description:
    "Vanlife content creation from Switzerland: product placement, UGC and brand collaborations filmed on the road in a self-built 1992 VW camper. Reels and photography in German and English, 470'500 views in 30 days.",
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

// Four, not five — five made the band restless. The Furka photo sits last so
// the figure in it looks into the strip rather than off the edge of the page.
// One photo per pillar, in the same order: the camper, the food, the ritual.
const PILLAR_PHOTOS = [
  {
    image: "/images/tour/card-humbaer.webp",
    alt: "Humbär parked at the forest edge with his café hatch open",
  },
  {
    image: "/images/tour/card-bakes.webp",
    alt: "A loaf fresh from the oven beside the handwritten café menu",
  },
  {
    image: "/images/tour/card-coffee.webp",
    alt: "The espresso machine and a tray of pastries inside the camper",
  },
];

const STEPS = [
  {
    title: "Tell us what you make",
    text: "Tell us about the product or the place. Let's talk about the story you want to tell, your expectations, and the format in which you'd like to collaborate with us.",
  },
  {
    title: "We plan it into the road",
    text: "We pick the stop, the season and the light, and write the story around it. We hold ourselves to high standards, take the work seriously, and let you see it before it goes out into the world.",
  },
  {
    title: "Your product finds its place",
    text: "Depending on what we agree on, your product or place becomes part of our social media content, or you receive the content material to use yourself.",
  },
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
  natural = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  sizes: string;
  priority?: boolean;
  mount?: boolean;
  /** Render at the file's own aspect ratio instead of inside a fixed frame,
      for rows whose photos must be shown whole. */
  natural?: boolean;
}) {
  const size = natural ? measureImage(src) : undefined;

  return (
    <figure className={mount ? "paper-card group overflow-hidden p-2.5" : "group"}>
      <div
        className={`relative overflow-hidden rounded-lg bg-ivory/25 ${
          mount ? "" : "border border-ink/10 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)]"
        } ${size ? "" : ratio}`}
      >
        {size ? (
          <Image
            src={src}
            alt={alt}
            width={size.width}
            height={size.height}
            sizes={sizes}
            priority={priority}
            className="h-auto w-full"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        )}
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
  const { instagramUrl } = getPage<{ instagramUrl: string }>("settings");
  // The handle is read off the URL rather than written twice, so changing the
  // account in the CMS can't leave a stale @name behind.
  const instagramHandle = isPlaceholder(instagramUrl)
    ? ""
    : `@${instagramUrl.replace(/\/+$/, "").split("/").pop()}`;
  const stops = getAllTourStops();
  const collabs = getAllCollabs();
  const pillars = intro.pillars ?? [];
  // Only show figures that have actually been filled in — a half-empty stats
  // row is worse for a brand reading this than none at all.
  const reach = (intro.reach ?? []).filter((item) => !isPlaceholder(item.value));
  const audience = (intro.audience ?? []).filter((item) => item.percent > 0);
  // Bars are drawn relative to the largest share, not to 100 — otherwise every
  // country is a sliver. The exact percentage is printed beside each one.
  const audienceMax = Math.max(...audience.map((item) => item.percent), 1);
  const facts = intro.audienceFacts ?? [];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${SITE_URL}/tour/#page`,
              url: `${SITE_URL}/tour/`,
              name: "Brand collaborations with The Ground Squirrel Café",
              isPartOf: { "@id": `${SITE_URL}/#website` },
              about: { "@id": `${SITE_URL}/tour/#collaboration` },
            },
            collaborationService(),
          ],
        }}
      />

      {/* ---------- Hero: a contact sheet of the road ---------- */}
      {/* A full screen, always. dvh rather than vh, so the film still fills
          the window exactly when a phone's chrome slides away — and min-h
          rather than h, so a short window lets the block grow instead of
          cropping the buttons off the bottom. */}
      <section className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden">
        {/* The poster is picked by the browser through <picture>, which
            honours `media` and fetches exactly one file; the film on top is
            chosen after mount for the same reason. See HeroVideo. */}
        <div className="absolute inset-0">
          <div
            role="img"
            aria-label="Humbär and a second camper parked by the shore in the evening sun, seen from above"
            className="tour-hero-still absolute inset-0"
          />
          <HeroVideo
            tallSrc="/videos/tour-hero-tall.mp4"
            tallPoster="/images/tour/hero-poster-tall.webp"
            wideSrc="/videos/tour-hero-wide.mp4"
            widePoster="/images/tour/hero-poster-wide.webp"
            label="Humbär and a second camper parked by the shore in the evening sun, seen from above"
          />
        </div>

        {/* An even scrim across the whole contact sheet, and a short melt into
            the page at the very bottom. A single top-to-bottom gradient washed
            the lower third out to nearly cream — which is exactly where the two
            buttons stand, and the outlined one disappeared into it. */}
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-cream/0 to-cream" />

        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-32 text-center text-cream sm:pt-32 sm:pb-40">
          <Image
            src="/images/brand/logo_badge_var.png"
            alt=""
            width={110}
            height={160}
            className="mx-auto mb-9 w-[4.5rem] drop-shadow-lg"
          />
          {/* A text shadow rather than drop-shadow-md: it follows the letter
              shapes instead of the block, so the serif keeps its edges against
              the bright grass behind it. Two layers — a tight one for the edge,
              a wide soft one to lift the whole line off the film. */}
          <h1 className="text-4xl leading-[1.05] text-balance text-cream [text-shadow:0_1px_2px_rgb(35_32_26/0.5),0_3px_24px_rgb(35_32_26/0.6)] sm:text-6xl lg:text-7xl">
            {splitLines(intro.heroHeadline).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#get-in-touch" className="btn btn-light">
              Get in touch
            </a>
            <a href="#partners" className="btn btn-outline-light">
              Previous partners
            </a>
            <a href="#how-it-works" className="btn btn-outline-light">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ---------- What this is ---------- */}
      {/* No frame, no accent, no overlap — the film ends, then a long, quiet
          breath, then the words. All the emphasis comes from the space around
          the paragraph and the air inside the lines; nothing is set louder
          than anything else. relative + z-10 keeps it above the hero's
          absolutely positioned overlay. */}
      <section className="relative z-10 mx-auto max-w-[42rem] px-6 pt-24 pb-2 text-center sm:pt-28 sm:pb-8">
        {splitLines(intro.intro).map((para, i) => (
          <p
            key={para}
            className={`text-pretty text-[1.0625rem] leading-[1.95] tracking-[0.02em] text-graphite sm:text-[1.15rem] ${
              i === 0 ? "" : "mt-7"
            }`}
          >
            {para}
          </p>
        ))}
      </section>

      {/* ---------- What the café is, and what a brand gets out of it ---------- */}
      <section id="collab" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-20 sm:px-10 sm:pt-28">
        <div className="max-w-2xl">
          <p className="eyebrow">{intro.collabKicker}</p>
          <h2 className="mt-4 text-3xl sm:text-[2.6rem]">{intro.collabHeading}</h2>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {pillars.map((pillar, i) => {
            const photo = PILLAR_PHOTOS[i];
            return (
              <div key={pillar.title} className="reveal flex flex-col">
                {photo && (
                  <Plate
                    src={photo.image}
                    alt={photo.alt}
                    natural
                    sizes="(max-width: 640px) 90vw, 30vw"
                    priority={i === 0}
                    mount
                  />
                )}
                <div className="mt-6 flex items-start gap-5">
                  <span className="mt-1.5 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-graphite/85">{pillar.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Collaborations we've already done ---------- */}
      {collabs.length > 0 && (
        <section id="partners" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-32">
          <div className="border-b border-ink/10 pb-8">
            <p className="eyebrow">{intro.casesKicker}</p>
            <h2 className="mt-4 text-3xl sm:text-[2.6rem]">{intro.casesHeading}</h2>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-10">
            {collabs.map((collab) => (
              <article key={collab.slug} className="reveal flex flex-col">
                {/* A justified row: every photo is scaled to the same height
                    from its own aspect ratio, so they line up without a single
                    one being cropped to fit a fixed frame. */}
                <div
                  className={`grid grid-cols-2 gap-2.5 sm:flex ${
                    collab.gallery.length === 1 ? "sm:max-w-xs" : ""
                  }`}
                >
                  {collab.gallery.map((photo, i) => (
                    <div
                      key={photo.image}
                      // Three across is too small to read on a phone, so the
                      // lead photo takes the full width there and the rest pair
                      // up beneath it. The flex values only bite from sm up.
                      className={`overflow-hidden rounded-lg border border-ink/10 bg-ivory/25 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)] ${
                        i === 0 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                      style={{
                        flexGrow: (photo.width ?? 3) / (photo.height ?? 4),
                        flexBasis: 0,
                      }}
                    >
                      <Image
                        src={photo.image}
                        alt={
                          isPlaceholder(photo.caption)
                            ? `${collab.partner} — ${collab.title}`
                            : photo.caption!
                        }
                        width={photo.width ?? 900}
                        height={photo.height ?? 1200}
                        sizes="(max-width: 1024px) 31vw, 16vw"
                        className="h-auto w-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-stamp text-[0.7rem] uppercase tracking-[0.18em] text-ink">
                    {collab.partner}
                  </span>
                  {collab.format && (
                    <span className="text-[0.7rem] uppercase tracking-[0.14em] text-graphite/60">
                      {collab.format}
                    </span>
                  )}
                  {!isPlaceholder(collab.year) && (
                    <span className="text-[0.7rem] uppercase tracking-[0.14em] text-graphite/60">
                      {collab.year}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-2xl leading-tight">{collab.title}</h3>
                <p className="mt-3 leading-relaxed text-graphite/85">{collab.description}</p>
                {!isPlaceholder(collab.link) && (
                  <a
                    href={collab.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-arrow mt-4 self-start text-sm"
                  >
                    See it
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Reach: figures, not adjectives ---------- */}
      {reach.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-32">
          <div className="band-ivory rounded-lg px-6 py-12 sm:px-12 sm:py-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="eyebrow">{intro.reachHeading}</p>
              {/* The figures are all from one account, so the account itself
                  belongs next to them — anyone weighing them up will want to
                  go and look. */}
              {instagramHandle && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/80 transition-colors hover:text-ink"
                >
                  <InstagramIcon size={15} />
                  {instagramHandle}
                </a>
              )}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
              {reach.map((item) => (
                <div key={item.label}>
                  {/* the accent marks the one figure we most want read; rose as
                      text would sit too close to the ivory band to be legible */}
                  {item.accent && (
                    <span aria-hidden className="mb-3 block h-[3px] w-9 rounded-full bg-rose" />
                  )}
                  <dd className="font-display text-[2rem] leading-none text-ink sm:text-[2.75rem]">
                    <CountUp value={item.value} />
                  </dd>
                  <dt className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/70">
                    {item.label}
                  </dt>
                  {item.note && <p className="mt-1 text-xs text-graphite/70">{item.note}</p>}
                </div>
              ))}
            </dl>

            {audience.length > 0 && (
              <div className="mt-12 grid gap-10 border-t border-ink/10 pt-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-graphite/70">
                    {intro.audienceHeading}
                  </p>
                  <ul className="mt-6 grid gap-3.5">
                    {audience.map((item, i) => (
                      <li key={item.label} className="flex items-center gap-4">
                        <span className="w-32 shrink-0 text-sm text-graphite sm:w-40">
                          {item.label}
                        </span>
                        <GrowBar width={(item.percent / audienceMax) * 100} delay={i * 90} />
                        <span className="w-14 shrink-0 text-right text-sm tabular-nums text-graphite">
                          <CountUp value={`${item.percent.toFixed(1)}%`} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {facts.length > 0 && (
                  <dl className="grid gap-7 self-start sm:grid-cols-3 lg:grid-cols-1">
                    {facts.map((fact) => (
                      <div key={fact.label} className="flex items-baseline gap-3">
                        <dd className="font-display text-2xl leading-none text-ink">
                          <CountUp value={fact.value} />
                        </dd>
                        <dt className="text-sm text-graphite">{fact.label}</dt>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}

            {intro.reachNote && (
              <p className="mt-10 text-xs tracking-wide text-graphite/65">{intro.reachNote}</p>
            )}
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-36">
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
            <h2 className="mt-5 text-3xl sm:text-[2.6rem]">{intro.stepsHeading}</h2>

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

            {intro.stepsNote && (
              <p className="mt-9 max-w-xl border-l-2 border-rose pl-5 leading-relaxed text-graphite">
                {intro.stepsNote}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Wide breath of dusk ---------- */}
      <section className="relative mt-24 sm:mt-32">
        <div className="relative isolate h-[22rem] sm:h-[28rem] lg:h-[32rem]">
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
            <p className="max-w-2xl text-center font-stamp text-xl leading-snug tracking-[0.02em] text-cream drop-shadow-md sm:text-3xl">
              Wherever we park, that&rsquo;s the café.
            </p>
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
                    // Justified: each photo keeps its own aspect ratio and is
                    // scaled to a shared height, so a portrait among squares
                    // lines up without being cut down to one.
                    <div className="mt-4 flex items-start gap-4">
                      {photos.slice(0, 3).map((photo) => (
                        <figure
                          key={photo.image}
                          style={{
                            flexGrow: (photo.width ?? 1) / (photo.height ?? 1),
                            flexBasis: 0,
                          }}
                        >
                          <div className="overflow-hidden rounded-lg border border-ink/10 bg-ivory/25 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)]">
                            <Image
                              src={photo.image}
                              alt={photo.caption ?? `The Ground Squirrel Café in ${stop.country}`}
                              width={photo.width ?? 1000}
                              height={photo.height ?? 1000}
                              sizes="(max-width: 1024px) 30vw, 15vw"
                              className="h-auto w-full"
                            />
                          </div>
                          {photo.caption && (
                            <figcaption className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60">
                              {photo.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- Booking the café: still an aside, but a visible one ---------- */}
      <section id="book" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-20 sm:px-10 sm:pt-28">
        <div className="band-ivory rounded-lg px-6 py-10 sm:px-12 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div>
              <p className="eyebrow">Bookings</p>
              <h2 className="mt-4 text-2xl leading-tight sm:text-[1.9rem]">
                {intro.bookingHeading}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-graphite">{intro.bookingText}</p>
            </div>
            <a
              href={`mailto:${intro.ctaEmail}?subject=${encodeURIComponent(
                "The Ground Squirrel Café — a pop-up"
              )}`}
              className="btn btn-primary shrink-0 self-start lg:self-auto"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Let's make something together ---------- */}
      <section id="get-in-touch" className="mt-24 scroll-mt-24 sm:mt-32">
        <div className="wash-warm border-y border-ink/10">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_1fr]">
            <div className="px-6 py-20 sm:px-10 sm:py-28">
              <p className="eyebrow">Collaborations</p>
              <h2 className="mt-5 max-w-lg text-balance text-3xl leading-[1.08] sm:text-[2.75rem]">
                {intro.ctaHeading}
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-graphite">{intro.ctaText}</p>

              <div className="mt-10">
                <a
                  href={`mailto:${intro.ctaEmail}?subject=${encodeURIComponent(
                    "Collaboration with The Ground Squirrel Café"
                  )}`}
                  className="btn btn-primary"
                >
                  Start a conversation
                </a>
              </div>
              <p className="mt-5 text-sm text-graphite/80">
                or write to{" "}
                <a href={`mailto:${intro.ctaEmail}`} className="link-underline text-ink">
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
