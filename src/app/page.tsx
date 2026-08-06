import Image from "next/image";
import Link from "next/link";
import { getAllJournalPosts, getPage } from "@/lib/content";

interface Settings {
  tagline: string;
  contactEmail: string;
  instagramUrl: string;
}

interface HomeContent {
  heroKicker: string;
  heroHeadline: string;
  heroSubline: string;
  welcomeHeading: string;
  welcomeText: string;
  bandCaption: string;
  studioHeading: string;
  studioText: string;
  closingHeading: string;
  closingText: string;
}

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

/**
 * Copy is written in the CMS, where the natural way to ask for a line or
 * paragraph break is either a real newline or a typed <br>. Neither survives
 * as-is in JSX, so split on both and let the caller render the parts as blocks
 * — no raw HTML from content has to be trusted.
 */
function splitLines(text: string): string[] {
  return text.split(/\s*(?:<br\s*\/?>|\n)\s*/).filter(Boolean);
}

const NAV_LINKS = [
  { href: "/tour", label: "Tour" },
  { href: "/journal", label: "Journal" },
  { href: "/studio", label: "Studio" },
  { href: "/shop", label: "Shop" },
  { href: "/crew", label: "Crew" },
];

/**
 * The index of the site, laid out as a magazine contents page: two wide plates
 * on the first row, three tall ones on the second. `span` is the width in
 * twelfths on desktop; everything below that is one or two even columns.
 *
 * The plates are sized by height rather than by aspect ratio, so that two
 * neighbours of different widths still end on the same line and their captions
 * read as a row — an aspect ratio would leave the narrower one hanging.
 */
const PLACES = [
  {
    href: "/tour",
    label: "Tour",
    sub: "The café on wheels, and how to book it for your day",
    image: "/images/tour/hero-3.webp",
    alt: "Humbär with his hatch open and the OPEN sign out",
    span: "lg:col-span-7",
    height: "h-[20rem] sm:h-[24rem] lg:h-[27rem]",
  },
  {
    href: "/journal",
    label: "Journal",
    sub: "Stories from the road",
    image: "/images/journal/sichuan-road-trip/IMG_6312.jpg",
    alt: "A misty mountain road in Sichuan",
    span: "lg:col-span-5",
    height: "h-[20rem] sm:h-[24rem] lg:h-[27rem]",
  },
  {
    href: "/studio",
    label: "Studio",
    sub: "Evelyne's wildlife illustration",
    image: "/images/studio/evelyne-in-humbaer.webp",
    alt: "Evelyne drawing at the table inside the camper",
    span: "lg:col-span-4",
    height: "h-[24rem] sm:h-[28rem] lg:h-[30rem]",
  },
  {
    href: "/shop",
    label: "Shop",
    sub: "Prints, stickers and picture books",
    image: "/images/studio/stickers-on-table.webp",
    alt: "Hand-drawn squirrel stickers spread on a table",
    span: "lg:col-span-4",
    height: "h-[24rem] sm:h-[28rem] lg:h-[30rem]",
  },
  {
    href: "/crew",
    label: "Crew",
    sub: "The people, the van, the mascot",
    image: "/images/crew/evelyne-and-frank.webp",
    alt: "Evelyne and Frank together outside the camper",
    span: "lg:col-span-4",
    height: "h-[24rem] sm:h-[28rem] lg:h-[30rem]",
  },
];

export default function Home() {
  const settings = getPage<Settings>("settings");
  const home = getPage<HomeContent>("home");
  const posts = getAllJournalPosts().slice(0, 3);

  return (
    <div>
      {/* ---------- Hero: the intro film, with the nav living inside it ---------- */}
      <section className="relative isolate overflow-hidden">
        {/* On phones the hero is a flex column in normal flow, so the brand mark
            and the welcome stack and the box grows to fit them. Only from sm up,
            where there is room, do they get pinned to the top and bottom. */}
        <div className="relative flex min-h-[max(38rem,88svh)] flex-col sm:block sm:h-[92vh] sm:max-h-[56rem] sm:min-h-[38rem]">
          {/* A phone crops the 16:9 film down to roughly its middle third, so it
              stays centred there — that band holds the van *and* the two of us
              waving beside it. From sm up the crop is shallow enough to shift
              left, which gives the welcome text below a quieter half to sit on. */}
          <video
            className="hero-video absolute inset-0 h-full w-full object-cover object-center sm:object-[30%_50%]"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/home/intro-poster.webp"
            aria-label="Humbär parked on a clifftop above the sea, with Evelyne and Frank waving from the open side door"
          >
            <source src="/videos/intro.mp4" type="video/mp4" />
          </video>
          {/* shown instead of the film when the visitor prefers reduced motion */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/intro-poster.webp"
            alt="Humbär parked on a clifftop above the sea, with Evelyne and Frank at the open side door"
            className="hero-still absolute inset-0 h-full w-full object-cover object-center sm:object-[30%_50%]"
          />

          <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-ink/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/85 via-ink/42 to-transparent" />

          {/* Brand mark and navigation, sitting on the film. */}
          <div className="relative z-10 px-6 pt-6 sm:absolute sm:inset-x-0 sm:top-0 sm:px-10 sm:pt-8">
            <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 sm:gap-3">
              <Link href="/" aria-label="The Ground Squirrel Café" className="shrink-0">
                <Image
                  src="/images/brand/logo_badge_var.png"
                  alt="The Ground Squirrel Café"
                  width={132}
                  height={192}
                  className="w-[4.7rem] drop-shadow-lg sm:w-[5.8rem]"
                  preload
                />
              </Link>

              {/* from sm up the links leave the flow and centre on the badge's
                  own mid-line, so the two sit level */}
              <nav className="flex items-center gap-6 sm:absolute sm:top-1/2 sm:right-0 sm:-translate-y-1/2 sm:gap-9">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="link-underline text-[0.68rem] uppercase tracking-[0.2em] text-cream/85 drop-shadow transition-colors hover:text-cream sm:text-[0.7rem]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* The welcome — held to the left half so it doesn't land on top of
              Evelyne and Frank, who stand right of centre in the film */}
          <div className="relative z-10 mt-auto px-6 pt-10 pb-12 sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:px-10 sm:pt-0 sm:pb-20">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl text-cream">
                <div className="flex items-center gap-4">
                  <span aria-hidden className="rule rule-light" />
                  <p className="eyebrow eyebrow-light">{home.heroKicker}</p>
                </div>
                <h1 className="mt-6 text-[2.75rem] leading-[1.02] text-cream drop-shadow-md sm:text-6xl lg:text-7xl">
                  {splitLines(home.heroHeadline).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-cream/85 drop-shadow-md sm:text-base">
                  {home.heroSubline}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/tour" className="btn btn-light">
                    Visit the café
                  </Link>
                  <Link href="/journal" className="btn btn-outline-light">
                    Read the journal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The index ---------- */}
      <section className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-32">
        <div className="text-center">
          <p className="eyebrow">have a look around</p>
          <h2 className="mt-4 text-3xl sm:text-[2.6rem]">Where would you like to go?</h2>
          <span aria-hidden className="rule mx-auto mt-6" />
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
          {PLACES.map((place, i) => (
            <Link
              key={place.href}
              href={place.href}
              className={`group reveal block ${place.span}`}
            >
              <div
                className={`relative overflow-hidden rounded-xl border border-ink/10 bg-ivory/25 shadow-[0_10px_26px_-24px_rgba(74,66,53,0.9)] ${place.height}`}
              >
                <Image
                  src={place.image}
                  alt={place.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>

              <div className="mt-5 flex items-start gap-5">
                <span className="mt-1.5 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl transition-colors duration-300 group-hover:text-rose">
                    {place.label}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-graphite/85">{place.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- The studio ---------- */}
      <section id="studio" className="mt-28 scroll-mt-24 sm:mt-40">
        <div className="wash-cool border-y border-ink/8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
            <div className="relative order-2 min-h-[16rem] lg:order-1 lg:min-h-[26rem]">
              <Image
                src="/images/studio/hero-squirrel.webp"
                alt="Evelyne's painting of a golden-mantled ground squirrel with a nut"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-contain drop-shadow-[0_24px_40px_rgba(35,32,26,0.14)]"
              />
            </div>

            <div className="order-1 lg:order-2">
              <p className="eyebrow">The Ground Squirrel Studio</p>
              <h2 className="mt-5 max-w-lg text-balance text-3xl leading-[1.08] sm:text-[2.75rem]">
                {home.studioHeading}
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-graphite">{home.studioText}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/studio" className="btn btn-primary">
                  Into the studio
                </Link>
                <Link href="/shop" className="btn btn-outline">
                  Visit the shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Who we are ---------- */}
      <section className="mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="reveal">
            <p className="eyebrow">Evelyne &amp; Frank</p>
            <h2 className="mt-5 text-3xl leading-[1.08] sm:text-[2.75rem]">
              {home.welcomeHeading}
            </h2>
            {splitLines(home.welcomeText).map((paragraph) => (
              <p key={paragraph} className="mt-6 max-w-xl leading-relaxed text-graphite">
                {paragraph}
              </p>
            ))}
            <Link href="/crew" className="link-arrow mt-9">
              Meet the whole crew
              <span data-arrow aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-2 overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
              <Image
                src="/images/home/welcome-van.webp"
                alt="Evelyne and Frank with coffee beside Humbär, below the Swiss alps"
                width={1154}
                height={1240}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
              <Image
                src="/images/home/welcome-frank.webp"
                alt="Frank laughing in the driver's window with a golden retriever"
                width={900}
                height={900}
                sizes="(max-width: 1024px) 45vw, 23vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
              <Image
                src="/images/home/welcome-table.webp"
                alt="Baklava, granola bowls and two coffees on a sunlit wooden table"
                width={900}
                height={900}
                sizes="(max-width: 1024px) 45vw, 23vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- A quiet moment ---------- */}
      <section className="relative mt-24 sm:mt-36">
        <div className="relative isolate h-[26rem] sm:h-[32rem] lg:h-[38rem]">
          <Image
            src="/images/home/band-wheel.webp"
            alt="A cappuccino with a heart in the foam, held in front of the VW steering wheel"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/30" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="max-w-2xl text-center font-stamp text-xl leading-snug tracking-[0.02em] text-cream drop-shadow-md sm:text-3xl">
              {home.bandCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Latest from the journal ---------- */}
      {posts.length > 0 && (
        <section id="journal" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-36">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
            <div>
              <p className="eyebrow">From the journal</p>
              <h2 className="mt-4 text-3xl sm:text-[2.6rem]">Lately, on the road</h2>
            </div>
            <Link href="/journal" className="link-arrow">
              All stories
              <span data-arrow aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`} className="group reveal block">
                <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 92vw, 30vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <p className="eyebrow mt-5">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
                <h3 className="mt-3 text-xl leading-snug transition-colors duration-300 group-hover:text-rose">
                  {post.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-graphite/85">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Come find us ---------- */}
      <section id="hello" className="relative mt-24 scroll-mt-24 sm:mt-36">
        <div className="relative isolate flex min-h-[34rem] items-center justify-center px-6 py-24">
          <Image
            src="/images/home/band-golden.webp"
            alt="The inside of the camper glowing orange in the evening sun"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* The evening light is brightest exactly where the invitation sits.
              Rather than shade the whole photograph down to read the words, the
              words get a frosted pane and the picture keeps its glow. */}
          <div className="absolute inset-0 bg-ink/20" />
          <div className="frosted-panel relative z-10 max-w-2xl px-6 py-14 text-center text-cream sm:px-14">
            <p className="eyebrow eyebrow-light">Say hello</p>
            <h2 className="mt-5 text-balance text-4xl leading-[1.08] text-cream sm:text-5xl">
              {home.closingHeading}
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-cream/85">
              {home.closingText}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/tour#book" className="btn btn-light">
                Book the café
              </Link>
              <a href={`mailto:${settings.contactEmail}`} className="btn btn-outline-light">
                Write to us
              </a>
              {!isPlaceholder(settings.instagramUrl) && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light"
                >
                  Follow along
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
