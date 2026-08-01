import Image from "next/image";
import Link from "next/link";
import { getAllJournalPosts, getPage } from "@/lib/content";

interface Settings {
  tagline: string;
}

const PREVIEW_CARDS = [
  {
    href: "/tour",
    label: "Tour",
    sub: "Café on wheels",
    image: "/images/journal/zermatt-five-lake-hike/IMG_9504.webp",
  },
  {
    href: "/journal",
    label: "Journal",
    sub: "Stories from the road",
    image: "/images/journal/sichuan-road-trip/IMG_6312.jpg",
  },
  {
    href: "/studio",
    label: "Studio",
    sub: "Evelyne's art",
    image: "/images/studio/placeholder-portfolio.svg",
  },
  {
    href: "/shop",
    label: "Shop",
    sub: "Squirrel goods",
    image: "/images/shop/placeholder-product.svg",
  },
  {
    href: "/crew",
    label: "Crew",
    sub: "Meet everyone",
    image: "/images/crew/evelyne-and-frank.webp",
  },
];

export default function Home() {
  const settings = getPage<Settings>("settings");
  const latestPost = getAllJournalPosts()[0];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <p className="text-center text-base sm:text-lg max-w-xl mx-auto mb-14 text-ink/80">
        {settings.tagline}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
        {PREVIEW_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-ink/10 shadow-sm bg-ivory"
          >
            <Image
              src={card.image}
              alt={card.label}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-cream">
              <div className="text-base sm:text-lg">{card.label}</div>
              <div className="text-xs opacity-80 hidden sm:block">{card.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {latestPost && (
        <div className="mt-16 text-center">
          <p className="text-sm text-ink/60 mb-2">Latest from the journal</p>
          <Link
            href={`/journal/${latestPost.slug}`}
            className="text-lg sm:text-xl hover:text-rose transition-colors"
          >
            {latestPost.title}
          </Link>
        </div>
      )}
    </div>
  );
}
