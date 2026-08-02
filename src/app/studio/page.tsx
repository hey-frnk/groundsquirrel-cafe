import Image from "next/image";
import {
  getPage,
  getStudioPortfolio,
  getStudioProjects,
  getStudioTeaching,
  markdownToHtml,
} from "@/lib/content";

interface StudioIntro {
  title: string;
  subtitle: string;
  intro: string;
  etsyUrl: string;
  edukiUrl: string;
}

interface Settings {
  contactEmail: string;
}

export const metadata = {
  title: "Studio — The Ground Squirrel Café",
};

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
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
      {/* Hero — "welcome to hummel & bear" */}
      <section className="sparkle-bg relative overflow-hidden bg-rose/25">
        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:py-20 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shrink-0">
            <Image
              src="/images/studio/hero-squirrel.webp"
              alt="A golden-mantled ground squirrel, hand-painted by Evelyne"
              fill
              sizes="256px"
              className="object-contain"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-ink/60 mb-1">welcome to</p>
            <div className="relative w-64 sm:w-80 h-14 sm:h-16 mx-auto sm:mx-0 mb-3">
              <Image
                src="/images/studio/hero-wordmark.webp"
                alt="hummel & bear"
                fill
                sizes="320px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-ink/60 italic mb-4">{intro.subtitle}</p>
            <p className="max-w-md text-ink/80">{intro.intro}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-16">
        {/* About */}
        <section className="mb-20">
          <h2 className="text-2xl mb-6 text-center">about hummel &amp; bear</h2>
          <div
            className="prose prose-sm max-w-2xl mx-auto text-center"
            dangerouslySetInnerHTML={{ __html: bioHtml }}
          />
          {!isPlaceholder(intro.etsyUrl) && (
            <p className="text-center mt-8">
              <a
                href={intro.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-rose text-ink px-6 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
              >
                Shop on Etsy →
              </a>
            </p>
          )}
        </section>

        {/* Art Portfolio */}
        <section className="mb-20">
          <h2 className="text-2xl mb-2 text-center">art portfolio</h2>
          <p className="text-center text-sm text-ink/70 italic mb-8">
            A warm hello from my mobile art space, Evelyne 🌿✨
          </p>
          <div className="columns-2 sm:columns-3 gap-4">
            {portfolio.map((item) => (
              <div key={item.slug} className="mb-4 break-inside-avoid">
                <div className="overflow-hidden rounded-xl border border-ink/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="block w-full h-auto"
                  />
                </div>
                <p className="text-xs mt-1.5 text-center text-ink/70">{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="mb-20">
          <h2 className="text-2xl mb-6 text-center">recent projects</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {projects.map((item) => (
              <div key={item.slug} className="flex flex-col rounded-xl border border-ink/10 overflow-hidden bg-white/40">
                <div className="relative aspect-[4/3]">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-ink/70">{item.description}</p>
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

        {/* Teaching Materials */}
        <section className="mb-20">
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

        {/* Collaborations */}
        <div className="rounded-2xl bg-lilac/30 border border-lilac px-6 py-10 text-center">
          <h2 className="text-2xl mb-3">collaborations</h2>
          <p className="max-w-xl mx-auto mb-2 text-ink/80">
            Are you looking for a passionate illustrator to bring your vision to life? Have
            one of my original paintings caught your eye, or do you have a special idea
            you&rsquo;d love to see painted?
          </p>
          <p className="max-w-xl mx-auto mb-6 text-ink/80">
            Whether it is for a book project, a flyer, a business card, or any other
            creative concept — don&rsquo;t hesitate to get in touch, I&rsquo;m looking
            forward to meeting you!
          </p>
          <a
            href={`mailto:${settings.contactEmail}`}
            className="inline-block rounded-full bg-ink text-cream px-8 py-3 transition-colors hover:bg-rose hover:text-ink"
          >
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
}
