import Link from "next/link";
import { notFound } from "next/navigation";
import ArtGallery from "@/components/studio/ArtGallery";
import { getStudioProject, getStudioProjects } from "@/lib/content";

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
    title: `${project.title} — The Ground Squirrel Café`,
    description: project.teaser,
    openGraph: {
      title: project.title,
      description: project.teaser,
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
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <Link href="/studio" className="text-sm text-ink/55 transition-colors hover:text-rose">
        ← Zurück zum Studio
      </Link>

      {/* Masthead */}
      <header className="mt-10 text-center">
        {project.kind && (
          <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{project.kind}</p>
        )}
        <h1 className="mt-4 text-3xl leading-tight sm:text-5xl">{project.title}</h1>
        {project.subtitle && (
          <p className="mt-3 text-ink/65 italic">{project.subtitle}</p>
        )}
        {project.status && (
          <p className="mt-4 inline-block rounded-full border border-ink/15 px-4 py-1.5 text-xs text-ink/60">
            {project.status}
          </p>
        )}
      </header>

      {/* The cover, when there is one to show */}
      {project.image && (
        <div className="mt-12">
          <ArtGallery plates={[{ image: project.image }]} layout="single" />
        </div>
      )}

      <div
        className="prose prose-sm mx-auto mt-12 max-w-2xl text-center"
        dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
      />

      {project.infoNote && (
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm italic text-ink/50">
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
                  className="inline-block rounded-full bg-ink px-7 py-3 text-sm text-cream transition-colors hover:bg-rose hover:text-ink"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-ink px-7 py-3 text-sm text-cream transition-colors hover:bg-rose hover:text-ink"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
          {project.availability && (
            <p className="mt-4 text-xs text-ink/55">{project.availability}</p>
          )}
        </div>
      )}
      {project.links.length === 0 && project.availability && (
        <p className="mt-8 text-center text-xs text-ink/55">{project.availability}</p>
      )}

      {/* Illustrations and working drawings */}
      <section className="mt-20">
        <h2 className="mb-2 text-center text-2xl">Aus der Werkstatt</h2>
        {project.gallery.length > 0 ? (
          <>
            <p className="mb-10 text-center text-sm text-ink/60">
              {project.galleryNote}
            </p>
            <ArtGallery plates={project.gallery} layout="grid" />
          </>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/55">
            {project.galleryNote ?? "Bilder zum Projekt folgen."}
          </p>
        )}
      </section>

      {/* Onward */}
      <div className="mt-24 border-t border-ink/10 pt-12 text-center">
        <p className="text-sm text-ink/55">Nächstes Projekt</p>
        <Link
          href={`/studio/${next.slug}`}
          className="mt-2 inline-block text-lg transition-colors hover:text-rose"
        >
          {next.title} →
        </Link>
        <p className="mt-8">
          <Link href="/studio" className="text-sm transition-colors hover:text-rose">
            ← Alle Projekte
          </Link>
        </p>
      </div>
    </div>
  );
}
