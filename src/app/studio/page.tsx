import Image from "next/image";
import Link from "next/link";
import ArtGallery from "@/components/studio/ArtGallery";
import ProjectCarousel from "@/components/studio/ProjectCarousel";
import StudioWordmark from "@/components/studio/StudioWordmark";
import {
  getPage,
  getStudioPortfolio,
  getStudioProjects,
  getStudioTeaching,
  markdownToHtml,
} from "@/lib/content";

interface StudioIntro {
  title: string;
  kicker: string;
  subtitle: string;
  intro: string;
  shopUrl: string;
  shopLabel: string;
  portfolioNote: string;
  edukiUrl: string;
  teachingNote: string;
}

interface Settings {
  contactEmail: string;
}

export const metadata = {
  title: "Studio — The Ground Squirrel Café",
  description:
    "the ground squirrel studio — Evelyne's creative space. Hand-painted wildlife illustration, picture books and teaching material, made on the road.",
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

/** A small drawn rule, so a new chapter of the page announces itself quietly. */
function Ornament({ children = "🌿" }: { children?: string }) {
  return (
    <div className="mt-7 flex items-center justify-center gap-3 text-ink/25">
      <span className="h-px w-12 bg-current" />
      <span aria-hidden>{children}</span>
      <span className="h-px w-12 bg-current" />
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{kicker}</p>
      <h2 className="mt-4 text-3xl sm:text-4xl">{title}</h2>
      {children && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
          {children}
        </p>
      )}
    </div>
  );
}

export default async function StudioPage() {
  const intro = getPage<StudioIntro>("studio-intro");
  const bioHtml = await markdownToHtml(intro.content);
  const portfolio = getStudioPortfolio();
  const projects = getStudioProjects();
  const teaching = getStudioTeaching();
  const settings = getPage<Settings>("settings");

  return (
    <div>
      {/* ---- Hero ---------------------------------------------------------- */}
      <section className="sparkle-bg washed-bg wash-dawn relative overflow-hidden">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-5 pt-16 pb-24 sm:flex-row sm:gap-14 sm:pt-24 sm:pb-32">
          <div className="relative h-56 w-56 shrink-0 sm:h-80 sm:w-80">
            <Image
              src="/images/studio/hero-squirrel.webp"
              alt="A golden-mantled ground squirrel, hand-painted by Evelyne"
              fill
              sizes="(max-width: 640px) 14rem, 20rem"
              priority
              className="object-contain drop-shadow-[0_18px_28px_rgba(74,66,53,0.18)]"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-ink/50">
              {intro.kicker}
            </p>
            <StudioWordmark className="mx-auto block w-full max-w-[19rem] sm:mx-0 sm:max-w-md" />
            <p className="mt-6 text-base italic text-ink/70">{intro.subtitle}</p>
            <p className="mt-5 max-w-md leading-relaxed text-ink/80">{intro.intro}</p>
          </div>
        </div>

        {/* A soft edge into the page, instead of a ruled line. */}
        <svg
          aria-hidden
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-12 w-full text-cream sm:h-20"
        >
          <path
            fill="currentColor"
            d="M0 90V44c120-22 240-33 360-33s240 11 360 33 240 33 360 22 240-33 360-44v68z"
          />
        </svg>
      </section>

      {/* What the studio stands for — the three things worth knowing up front. */}
      <div className="mx-auto max-w-4xl px-5">
        <ul className="grid gap-3 text-center text-xs leading-relaxed text-ink/65 sm:grid-cols-3 sm:gap-5">
          {[
            "Painted by hand — never by a machine",
            "Published in Switzerland, Germany & Austria",
            "10% of every sale funds wildlife conservation",
          ].map((line) => (
            <li key={line} className="rounded-full bg-ivory/40 px-5 py-3">
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* ---- About --------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 pt-20 sm:pt-28">
        <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-14">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="paper-card overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studio/evelyne-in-humbaer.webp"
                alt="Evelyne painting inside Humbär, the studio on wheels"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="art-protected block aspect-[4/5] w-full object-cover"
              />
            </div>
            {/* The studio stamp, pressed onto the corner of the photo. */}
            <Image
              src="/images/studio/brand/studio-badge.webp"
              alt=""
              width={140}
              height={140}
              className="absolute -bottom-6 -right-3 w-20 rotate-[-8deg] drop-shadow-md sm:-right-8 sm:w-28"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">
              about the studio
            </p>
            {/* The bio opens with "as long as I can remember…", so the heading
                introduces her instead of repeating the first line back. */}
            <h2 className="mt-4 text-3xl leading-snug sm:text-4xl">
              Hej, I&rsquo;m Evelyne.
            </h2>
            <div
              className="prose prose-sm mt-6 max-w-none prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />
            {!isPlaceholder(intro.shopUrl) && (
              <p className="mt-8">
                <Link
                  href={intro.shopUrl}
                  className="inline-block rounded-full bg-ink px-8 py-3 text-cream transition-colors hover:bg-rose hover:text-ink"
                >
                  {intro.shopLabel ?? "shop my art"}
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---- Portfolio ----------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 pt-24 sm:pt-32">
        <SectionHead kicker="art portfolio" title="Painted mostly outdoors">
          {intro.portfolioNote}
        </SectionHead>
        <Ornament>🐿️</Ornament>

        <div className="mt-12">
          <ArtGallery
            plates={portfolio.map((item) => ({
              image: item.image,
              caption: item.title,
              width: item.width,
              height: item.height,
            }))}
          />
        </div>
      </section>

      {/* ---- Projects ------------------------------------------------------ */}
      <section className="mt-24 bg-ivory/35 py-20 sm:mt-32 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHead kicker="publications & recent projects" title="Books, in the making">
            Every project has its own page — the story behind it, and the
            illustrations as they came together.
          </SectionHead>
          <div className="mt-12">
            <ProjectCarousel projects={projects} />
          </div>
        </div>
      </section>

      {/* ---- Teaching material --------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-5 pt-20 sm:pt-24">
        <SectionHead kicker="unterrichtsmaterial" title="Material für den Unterricht" />
        {teaching.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink/60">
            {intro.teachingNote}
            {!isPlaceholder(intro.edukiUrl) && (
              <>
                {" "}
                <a
                  href={intro.edukiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose hover:underline"
                >
                  Zum Eduki-Shop →
                </a>
              </>
            )}
          </p>
        ) : (
          <>
            {!isPlaceholder(intro.edukiUrl) && (
              <p className="mt-6 text-center text-sm text-ink/70">
                <a
                  href={intro.edukiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose hover:underline"
                >
                  Zum Eduki-Shop →
                </a>
              </p>
            )}
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3">
              {teaching.map((item) => (
                <div key={item.slug} className="flex flex-col">
                  <div className="paper-card relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm">{item.title}</p>
                  {!isPlaceholder(item.edukiLink) && (
                    <a
                      href={item.edukiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs text-rose hover:underline"
                    >
                      View on Eduki →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ---- Collaborations ------------------------------------------------ */}
      <section
        id="collaborations"
        className="sparkle-bg washed-bg wash-dusk mt-24 py-20 sm:mt-32 sm:py-28"
      >
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/45">collaborations</p>
          <h2 className="mt-4 text-3xl leading-snug sm:text-5xl">
            Let&rsquo;s make something<br className="hidden sm:inline" /> beautiful together
          </h2>

          <p className="mx-auto mt-8 max-w-xl leading-relaxed text-ink/80">
            Are you looking for a passionate illustrator to bring your vision to life? Have
            one of my original paintings caught your eye, or do you have a special idea
            you&rsquo;d love to see painted?
          </p>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink/80">
            Whether it is for a book project, a flyer, a business card, or any other
            creative concept — don&rsquo;t hesitate to get in touch, I&rsquo;m looking
            forward to meeting you!
          </p>

          <ul className="mx-auto mt-10 grid max-w-2xl gap-3 text-sm text-ink/75 sm:grid-cols-3 sm:gap-4">
            {["Book projects", "Teaching material", "Flyers, cards & bespoke ideas"].map(
              (item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-ink/10 bg-cream/60 px-4 py-4 leading-snug"
                >
                  {item}
                </li>
              )
            )}
          </ul>

          <a
            href={`mailto:${settings.contactEmail}`}
            className="mt-10 inline-block rounded-full bg-ink px-10 py-4 text-cream transition-colors hover:bg-rose hover:text-ink"
          >
            Get in touch
          </a>
          <p className="mt-4 text-xs text-ink/50">{settings.contactEmail}</p>
        </div>
      </section>
    </div>
  );
}
