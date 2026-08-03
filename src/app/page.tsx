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

const PLACES = [
  {
    href: "/tour",
    label: "Tour",
    sub: "The café on wheels — and how to book it for your event",
    image: "/images/tour/hero-3.webp",
    alt: "Humbär with his hatch open and the OPEN sign out",
    wide: true,
  },
  {
    href: "/journal",
    label: "Journal",
    sub: "Stories from the road",
    image: "/images/journal/sichuan-road-trip/IMG_6312.jpg",
    alt: "A misty mountain road in Sichuan",
  },
  {
    href: "/studio",
    label: "Studio",
    sub: "Evelyne's wildlife art",
    image: "/images/studio/evelyne-in-humbaer.webp",
    alt: "Evelyne drawing at the table inside the camper",
  },
  {
    href: "/shop",
    label: "Shop",
    sub: "Squirrel goods",
    image: "/images/studio/stickers-on-table.webp",
    alt: "Hand-drawn squirrel stickers spread on a table",
  },
  {
    href: "/crew",
    label: "Crew",
    sub: "Meet everyone, van included",
    image: "/images/crew/evelyne-and-frank.webp",
    alt: "Evelyne and Frank together outside the camper",
  },
];

export default function Home() {
  const settings = getPage<Settings>("settings");
  const home = getPage<HomeContent>("home");
  const posts = getAllJournalPosts().slice(0, 3);

  return (
    <div>
      {/* ---------- Hero: the hand-painted sign, and the view out the door ---------- */}
      <section>
        {/* fixed ratios rather than vh, so the sign and the window are always
            both in frame whatever the viewport does */}
        <div className="relative aspect-4/5 sm:aspect-5/2">
          {/* Art-directed: the wide crop loses the sign on narrow screens. A real
              <picture> (rather than two <Image>s toggled with `hidden`) so only
              the crop actually shown gets downloaded — images are unoptimized in
              this export anyway, so next/image would add nothing here. */}
          <picture>
            <source media="(min-width: 640px)" srcSet="/images/home/hero-wide.webp" />
            <img
              src="/images/home/hero-tall.webp"
              alt="A guitar and a hand-painted 'the ground squirrel café' sign above the open door of the camper, looking out over a green Swiss valley"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        </div>

        <div className="mx-auto max-w-3xl px-5 pt-10 text-center sm:pt-14">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/55">
            {home.heroKicker}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight">
            {home.heroHeadline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/75">{settings.tagline}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tour"
              className="rounded-full bg-ink px-7 py-3 text-cream transition-colors hover:bg-rose hover:text-ink"
            >
              Visit the café
            </Link>
            <Link
              href="/journal"
              className="rounded-full border border-ink/25 px-7 py-3 transition-colors hover:bg-ivory"
            >
              Read the journal
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Who we are ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl sm:text-4xl leading-tight">{home.welcomeHeading}</h2>
            <p className="mt-5 leading-relaxed text-ink/75">{home.welcomeText}</p>
            <Link
              href="/crew"
              className="mt-7 inline-block text-sm underline decoration-rose decoration-2 underline-offset-4 transition-colors hover:text-rose"
            >
              Meet the whole crew →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="col-span-2 overflow-hidden rounded-2xl border border-ink/10 shadow-sm">
              <Image
                src="/images/home/welcome-van.webp"
                alt="Evelyne and Frank with coffee beside Humbär, below the Swiss alps"
                width={1154}
                height={780}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-sm">
              <Image
                src="/images/home/welcome-frank.webp"
                alt="Frank laughing in the driver's window with a golden retriever"
                width={900}
                height={1125}
                sizes="(max-width: 1024px) 45vw, 23vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-sm">
              <Image
                src="/images/home/welcome-table.webp"
                alt="Baklava, granola bowls and two coffees on a sunlit wooden table"
                width={900}
                height={1125}
                sizes="(max-width: 1024px) 45vw, 23vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Where to go next ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PLACES.map((place) => (
            <Link
              key={place.href}
              href={place.href}
              className={`group relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory shadow-sm ${
                place.wide
                  ? "col-span-2 aspect-4/3 sm:aspect-16/9 lg:aspect-auto lg:row-span-2"
                  : "aspect-3/4"
              }`}
            >
              <Image
                src={place.image}
                alt={place.alt}
                fill
                sizes={place.wide ? "(max-width: 1024px) 92vw, 46vw" : "(max-width: 1024px) 45vw, 23vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-cream">
                <div className={place.wide ? "text-2xl sm:text-3xl" : "text-lg"}>{place.label}</div>
                <div className="mt-0.5 text-xs opacity-85 sm:text-sm">{place.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- A quiet moment ---------- */}
      <section className="relative mt-16 sm:mt-24">
        <div className="relative h-56 sm:h-72 lg:h-96">
          <Image
            src="/images/home/band-wheel.webp"
            alt="A cappuccino with a heart in the foam, held in front of the VW steering wheel"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/25" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="max-w-2xl text-center text-xl sm:text-3xl leading-snug text-cream drop-shadow-md">
              {home.bandCaption}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Latest from the journal ---------- */}
      {posts.length > 0 && (
        <section id="journal" className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24 scroll-mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/50">
                From the journal
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Lately, on the road</h2>
            </div>
            <Link
              href="/journal"
              className="text-sm underline decoration-rose decoration-2 underline-offset-4 transition-colors hover:text-rose"
            >
              All stories →
            </Link>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`} className="group block">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink/10 bg-ivory">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 92vw, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-xs text-ink/50">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}{" "}
                  · {post.author}
                </p>
                <h3 className="mt-1 text-lg leading-snug transition-colors group-hover:text-rose">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- The studio ---------- */}
      <section id="studio" className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24 scroll-mt-8">
        <div className="overflow-hidden rounded-3xl border border-lilac bg-lilac/25">
          <div className="grid items-center lg:grid-cols-[1fr_0.85fr]">
            <div className="px-6 py-10 sm:px-12 sm:py-14">
              <h2 className="text-3xl sm:text-4xl leading-tight">{home.studioHeading}</h2>
              <p className="mt-5 leading-relaxed text-ink/80">{home.studioText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/studio"
                  className="rounded-full bg-ink px-7 py-3 text-cream transition-colors hover:bg-cream hover:text-ink"
                >
                  Into the studio
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-ink/25 px-7 py-3 transition-colors hover:bg-cream/70"
                >
                  Visit the shop
                </Link>
              </div>
            </div>

            <div className="sparkle-bg relative min-h-64 lg:min-h-full">
              <Image
                src="/images/studio/hero-squirrel.webp"
                alt="Evelyne's painting of a golden-mantled ground squirrel with a nut"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain p-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Come find us ---------- */}
      <section id="hello" className="relative mt-16 sm:mt-24 scroll-mt-8">
        <div className="relative flex min-h-112 items-center justify-center px-5 sm:min-h-125">
          <Image
            src="/images/home/band-golden.webp"
            alt="The inside of the camper glowing orange in the evening sun"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/25" />
          {/* frosted panel so the text stays readable over the bright evening glow */}
          <div className="relative my-12 flex max-w-2xl flex-col items-center rounded-[2rem] bg-ink/45 px-6 py-12 text-center text-cream backdrop-blur-[3px] sm:px-12">
            <h2 className="text-3xl sm:text-4xl">{home.closingHeading}</h2>
            <p className="mt-5 leading-relaxed text-cream/90">{home.closingText}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tour#book"
                className="rounded-full bg-rose px-7 py-3 text-ink shadow-lg transition-colors hover:bg-cream"
              >
                Book the café
              </Link>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="rounded-full border border-cream/60 px-7 py-3 text-cream transition-colors hover:bg-cream/15"
              >
                Write to us
              </a>
              {!isPlaceholder(settings.instagramUrl) && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream/60 px-7 py-3 text-cream transition-colors hover:bg-cream/15"
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
