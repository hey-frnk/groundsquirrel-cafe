import Image from "next/image";
import { getAllTourStops, getPage } from "@/lib/content";

interface TourIntro {
  title: string;
  intro: string;
  ctaHeading: string;
  ctaText: string;
  ctaEmail: string;
}

export const metadata = {
  title: "Tour — The Ground Squirrel Café",
};

export default function TourPage() {
  const intro = getPage<TourIntro>("tour-intro");
  const stops = getAllTourStops();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl sm:text-4xl text-center mb-4">{intro.title}</h1>
      <p className="text-center text-ink/80 max-w-xl mx-auto mb-14">{intro.intro}</p>

      <div className="grid sm:grid-cols-2 gap-8 mb-16">
        {stops.map((stop) => (
          <div
            key={stop.slug}
            className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white/40"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={stop.photo}
                alt={stop.location}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs text-ink/50 mb-1">
                {new Date(stop.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
              <h2 className="text-lg mb-1">{stop.location}</h2>
              <p className="text-sm text-ink/70">{stop.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-rose/40 border border-rose px-6 py-10 sm:py-14 text-center">
        <h2 className="text-2xl sm:text-3xl mb-3">{intro.ctaHeading}</h2>
        <p className="max-w-xl mx-auto mb-6 text-ink/80">{intro.ctaText}</p>
        <a
          href={`mailto:${intro.ctaEmail}`}
          className="inline-block rounded-full bg-ink text-cream px-8 py-3 transition-colors hover:bg-rose hover:text-ink"
        >
          Get in touch
        </a>
      </div>
    </div>
  );
}
