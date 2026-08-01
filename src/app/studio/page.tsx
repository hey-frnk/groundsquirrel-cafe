import Image from "next/image";
import {
  getPage,
  getStudioPortfolio,
  getStudioProjects,
  getStudioTeaching,
} from "@/lib/content";

interface StudioIntro {
  title: string;
  intro: string;
  edukiUrl: string;
}

export const metadata = {
  title: "Studio — The Ground Squirrel Café",
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

export default function StudioPage() {
  const intro = getPage<StudioIntro>("studio-intro");
  const portfolio = getStudioPortfolio();
  const projects = getStudioProjects();
  const teaching = getStudioTeaching();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl sm:text-4xl text-center mb-4">{intro.title}</h1>
      <p className="text-center text-ink/80 max-w-xl mx-auto mb-16">{intro.intro}</p>

      <section className="mb-16">
        <h2 className="text-2xl mb-6 text-center">Portfolio</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div key={item.slug} className="flex flex-col">
              <div className="relative aspect-square rounded-xl overflow-hidden border border-ink/10">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm mt-2 text-center text-ink/80">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl mb-6 text-center">Projects &amp; Publications</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((item) => (
            <div
              key={item.slug}
              className="flex gap-4 rounded-xl border border-ink/10 p-4 bg-white/40"
            >
              <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-ink/10">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-ink/70 mb-2">{item.description}</p>
                {!isPlaceholder(item.link) && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-rose hover:underline"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-2 text-center">Teaching Materials</h2>
        <p className="text-center text-sm text-ink/70 mb-6">
          German-language classroom material, available on Eduki.
          {!isPlaceholder(intro.edukiUrl) && (
            <>
              {" "}
              <a
                href={intro.edukiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose hover:underline"
              >
                Visit the Eduki shop →
              </a>
            </>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {teaching.map((item) => (
            <div key={item.slug} className="flex flex-col">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-ink/10">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm mt-2 text-center">{item.title}</p>
              {!isPlaceholder(item.edukiLink) && (
                <a
                  href={item.edukiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-rose hover:underline text-center"
                >
                  View on Eduki →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
