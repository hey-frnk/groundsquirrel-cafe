import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ArtGallery from "@/components/studio/ArtGallery";
import { getStudioProject, getStudioProjects } from "@/lib/content";
import { SITE_URL, evelynePerson } from "@/lib/seo";

export function generateStaticParams() {
  return getStudioProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getStudioProjects().find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: { absolute: `${project.title} — Illustration by Evelyne Buttet` },
    description: project.teaser
      ? `${project.teaser} Illustrated by Evelyne Buttet, the ground squirrel studio.`
      : `A project by illustrator Evelyne Buttet, the ground squirrel studio.`,
    alternates: { canonical: `${SITE_URL}/studio/${slug}/` },
    openGraph: {
      title: `${project.title} — Illustration by Evelyne Buttet`,
      description: project.teaser,
      url: `${SITE_URL}/studio/${slug}/`,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = getStudioProjects();
  if (!all.some((p) => p.slug === slug)) notFound();

  const project = await getStudioProject(slug);
  const at = all.findIndex((p) => p.slug === slug);
  const next = all[(at + 1) % all.length];

  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-4 sm:pt-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          url: `${SITE_URL}/studio/${slug}/`,
          description: project.teaser ?? project.description,
          image: project.image ? `${SITE_URL}${project.image}` : undefined,
          creator: evelynePerson(),
        }}
      />

      <Link href="/studio" className="link-arrow is-back">
        <span data-arrow aria-hidden>
          ←
        </span>
        Zurück zum Studio
      </Link>

      {/* Masthead */}
      <header className="mt-14 border-b border-ink/10 pb-10 text-center">
        {project.kind && <p className="eyebrow">{project.kind}</p>}
        <h1 className="mt-6 text-balance text-4xl leading-[1.08] sm:text-6xl">{project.title}</h1>
        {project.subtitle && (
          <p className="mt-5 font-display text-lg text-graphite">{project.subtitle}</p>
        )}
        {project.status && (
          <p className="mt-7 inline-block rounded-full border border-ink/15 bg-ivory/25 px-4 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-graphite/80">
            {project.status}
          </p>
        )}
        {!project.hideCredit && (
          <p className="mt-7 text-[0.7rem] uppercase tracking-[0.2em] text-graphite/65">
            Illustration:{" "}
            <Link href="/studio/" className="link-underline text-ink">
              Evelyne Buttet
            </Link>
          </p>
        )}
      </header>

      {/* The cover, when there is one to show */}
      {project.image && (
        <div className="mt-14">
          <ArtGallery plates={[{ image: project.image }]} layout="single" />
        </div>
      )}

      <div
        lang={project.lang}
        className="prose prose-sm mx-auto mt-14 max-w-2xl text-center"
        dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
      />

      {project.highlights.length > 0 && (
        <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {project.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-center gap-2.5 text-sm leading-relaxed text-graphite"
            >
              <span aria-hidden className="text-[0.55rem] text-rose">
                ◆
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      )}

      {project.infoNote && (
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-graphite/70">
          {project.infoNote}
        </p>
      )}

      {/* Where to find it */}
      {project.links.length > 0 && (
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {project.links.map((link) =>
              link.url.startsWith("/") ? (
                <Link
                  key={link.url}
                  href={link.url}
                  className="btn btn-primary"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
          {project.availability && (
            <p className="mt-5 text-[0.7rem] uppercase tracking-[0.14em] text-graphite/65">
              {project.availability}
            </p>
          )}
        </div>
      )}
      {project.links.length === 0 && project.availability && (
        <p className="mt-8 text-center text-[0.7rem] uppercase tracking-[0.14em] text-graphite/65">
          {project.availability}
        </p>
      )}

      {/* The publisher's own particulars */}
      {project.details.length > 0 && (
        <section className="mx-auto mt-16 max-w-2xl rounded-2xl border border-ink/12 bg-ivory/20 px-7 py-9 sm:px-10">
          <h2 className="eyebrow text-center">Angaben zum Buch</h2>
          <dl className="mt-7 space-y-0">
            {project.details.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-1 border-t border-ink/10 py-3 first:border-t-0 first:pt-0 sm:flex-row sm:gap-6"
              >
                <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-graphite/70 sm:w-40 sm:shrink-0 sm:pt-1">
                  {detail.label}
                </dt>
                <dd className="text-sm leading-relaxed text-graphite">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Illustrations and working drawings */}
      <section className="mt-24">
        <div className="border-b border-ink/10 pb-8 text-center">
          {/* `.eyebrow` is unlayered, so it dresses this heading as a label
              without the base-layer serif winning it back. */}
          <h2 className="eyebrow">Aus der Werkstatt</h2>
          {project.gallery.length > 0 && project.galleryNote && (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-graphite/85">
              {project.galleryNote}
            </p>
          )}
        </div>
        {project.gallery.length > 0 ? (
          <div className="mt-12">
            <ArtGallery plates={project.gallery} layout="grid" />
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-ink/12 bg-ivory/20 px-6 py-14 text-center text-sm text-graphite/70">
            {project.galleryNote ?? "Bilder zum Projekt folgen."}
          </p>
        )}
      </section>

      {/* Onward */}
      <div className="mt-28 border-t border-ink/10 pt-14 text-center">
        <p className="eyebrow">Nächstes Projekt</p>
        <Link
          href={`/studio/${next.slug}`}
          className="mt-5 inline-block font-display text-2xl transition-colors duration-300 hover:text-rose sm:text-3xl"
        >
          {next.title} →
        </Link>
        <p className="mt-10">
          <Link href="/studio" className="link-arrow is-back">
            <span data-arrow aria-hidden>
              ←
            </span>
            Alle Projekte
          </Link>
        </p>
      </div>
    </div>
  );
}
