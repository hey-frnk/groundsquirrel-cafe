import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
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
import { SITE_URL, evelynePerson } from "@/lib/seo";

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
  title: { absolute: "Evelyne Buttet — Illustrator | the ground squirrel studio" },
  description:
    "Evelyne Buttet is a Swiss illustrator and author. Hand-painted wildlife illustration, picture books and teaching material from the ground squirrel studio — painted on the road, never by AI.",
  alternates: { canonical: `${SITE_URL}/studio/` },
  openGraph: {
    type: "profile",
    title: "Evelyne Buttet — Illustrator | the ground squirrel studio",
    description:
      "Wildlife illustration, picture books and teaching material by Swiss illustrator and author Evelyne Buttet.",
    url: `${SITE_URL}/studio/`,
    images: ["/images/studio/portfolio/field-guide-eurasian-red-squirrel.webp"],
  },
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
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
    <div className="flex flex-col gap-6 border-b border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2 className="mt-4 text-3xl sm:text-[2.6rem]">{title}</h2>
      </div>
      {children && (
        <p className="max-w-sm text-sm leading-relaxed text-graphite/85">{children}</p>
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${SITE_URL}/studio/`,
          name: "Evelyne Buttet — Illustrator | the ground squirrel studio",
          mainEntity: evelynePerson(),
        }}
      />

      {/* ---- Hero ---------------------------------------------------------- */}
      <section className="wash-warm border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 px-6 pt-20 pb-24 sm:flex-row sm:gap-16 sm:pt-28 sm:pb-32">
          <div className="relative h-56 w-56 shrink-0 sm:h-80 sm:w-80">
            <Image
              src="/images/studio/hero-squirrel.webp"
              alt="A golden-mantled ground squirrel, hand-painted by Evelyne Buttet"
              fill
              sizes="(max-width: 640px) 14rem, 20rem"
              priority
              className="object-contain drop-shadow-[0_20px_32px_rgba(35,32,26,0.16)]"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="eyebrow">{intro.kicker}</p>
            <StudioWordmark className="mx-auto mt-6 block w-full max-w-[19rem] sm:mx-0 sm:max-w-md" />
            <p className="mt-7 font-display text-lg text-ink">{intro.subtitle}</p>
            <p className="mt-4 max-w-md leading-relaxed text-graphite">{intro.intro}</p>
          </div>
        </div>
      </section>

      {/* What the studio stands for — the three things worth knowing up front. */}
      <div className="border-b border-ink/10">
        <ul className="mx-auto grid max-w-5xl divide-y divide-ink/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            "A love letter to nature born from the wild things",
            "Painted with heart and soul",
            "10% of every sale funds wildlife conservation",
          ].map((line, i) => (
            <li key={line} className="flex gap-4 px-0 py-6 sm:px-7">
              <span className="mt-0.5 shrink-0 font-stamp text-[0.7rem] tracking-[0.15em] text-ink/45">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-graphite">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- About --------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
        <div className="grid items-center gap-12 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-16">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="art-frame overflow-hidden p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/studio/evelyne-in-humbaer.webp"
                alt="Illustrator Evelyne Buttet painting inside Humbär, the studio on wheels"
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
              className="absolute -right-3 -bottom-6 w-20 drop-shadow-md sm:-right-8 sm:w-28"
            />
          </div>

          <div>
            <p className="eyebrow">About the studio</p>
            {/* The bio opens with "as long as I can remember…", so the heading
                introduces her instead of repeating the first line back. */}
            <h2 className="mt-5 text-3xl leading-[1.1] sm:text-[2.6rem]">
              Hej, I&rsquo;m Evelyne Buttet.
            </h2>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-graphite/65">
              Illustrator &amp; author, Switzerland
            </p>
            <div
              className="prose prose-sm mt-8 max-w-none prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />
            {!isPlaceholder(intro.shopUrl) && (
              <p className="mt-10">
                <Link href={intro.shopUrl} className="btn btn-primary">
                  {intro.shopLabel ?? "shop my art"}
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---- Portfolio ----------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-36">
        <SectionHead kicker="Art portfolio" title="Painted on the road">
          {intro.portfolioNote}
        </SectionHead>

        <div className="mt-14">
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
      <section className="band-ivory mt-24 py-20 sm:mt-36 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead kicker="Publications & recent projects" title="Books, in the making" />
          <div className="mt-14">
            <ProjectCarousel projects={projects} />
          </div>
        </div>
      </section>

      {/* ---- Teaching material --------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
        <SectionHead kicker="Unterrichtsmaterial" title="Material für den Unterricht" />
        {teaching.length === 0 ? (
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-graphite/85">
            {intro.teachingNote}
            {!isPlaceholder(intro.edukiUrl) && (
              <>
                {" "}
                <a
                  href={intro.edukiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-ink"
                >
                  Zum Eduki-Shop
                </a>
              </>
            )}
          </p>
        ) : (
          <>
            {!isPlaceholder(intro.edukiUrl) && (
              <p className="mt-8">
                <a
                  href={intro.edukiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-arrow"
                >
                  Zum Eduki-Shop
                  <span data-arrow aria-hidden>
                    →
                  </span>
                </a>
              </p>
            )}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {teaching.map((item) => (
                <div key={item.slug} className="group flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-snug text-ink">{item.title}</p>
                  {!isPlaceholder(item.edukiLink) && (
                    <a
                      href={item.edukiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline mt-1.5 self-start text-[0.7rem] uppercase tracking-[0.16em] text-graphite/75"
                    >
                      View on Eduki
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ---- Collaborations ------------------------------------------------ */}
      <section id="collaborations" className="wash-cool mt-24 border-t border-ink/10 py-24 sm:mt-36 sm:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="eyebrow">Collaborations</p>
          <h2 className="mt-6 text-3xl leading-[1.1] sm:text-5xl">
            Let&rsquo;s make something
            <br className="hidden sm:inline" /> beautiful together
          </h2>

          <p className="mx-auto mt-8 max-w-xl leading-relaxed text-graphite">
            Are you looking for a passionate illustrator to bring your vision to life? Have one
            of my original paintings caught your eye, or do you have a special idea you&rsquo;d
            love to see painted?
          </p>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-graphite">
            Whether it is for a book project, a flyer, a business card, or any other creative
            concept — don&rsquo;t hesitate to get in touch, I&rsquo;m looking forward to meeting
            you!
          </p>

          <ul className="mx-auto mt-12 grid max-w-2xl border-t border-ink/12 sm:grid-cols-3 sm:border-t-0">
            {["Book projects", "Personalized drawings", "Flyers, cards & bespoke ideas"].map(
              (item) => (
                <li
                  key={item}
                  className="border-b border-ink/12 px-4 py-5 text-sm leading-snug text-graphite sm:border-t sm:border-b-0"
                >
                  {item}
                </li>
              )
            )}
          </ul>

          <a href={`mailto:${settings.contactEmail}`} className="btn btn-primary mt-12">
            Get in touch
          </a>
          <p className="mt-5 text-[0.7rem] uppercase tracking-[0.16em] text-graphite/60">
            Evelyne Buttet — {settings.contactEmail}
          </p>
        </div>
      </section>
    </div>
  );
}
