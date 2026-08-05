import { getPage } from "./content";

export const SITE_URL = "https://thegroundsquirrel.cafe";

interface Settings {
  contactEmail: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

/**
 * Structured data for Evelyne Buttet.
 *
 * Her name is the thing people search for — it belongs in the page's visible
 * text, and this tells a search engine that the several places it appears
 * (studio, crew, book credits) are one person, with the social profiles as
 * corroboration. Everything asserted here is stated somewhere on the site; do
 * not add claims that only live in this file.
 */
export function evelynePerson() {
  const settings = getPage<Settings>("settings");

  return {
    "@type": "Person",
    "@id": `${SITE_URL}/studio/#evelyne-buttet`,
    name: "Evelyne Buttet",
    givenName: "Evelyne",
    familyName: "Buttet",
    jobTitle: "Illustrator & author",
    description:
      "Evelyne Buttet is a Swiss illustrator and author. She paints wildlife in watercolour and works on picture books, children's books and teaching material from a 1992 VW LT camper van.",
    url: `${SITE_URL}/studio/`,
    image: `${SITE_URL}/images/studio/brand/studio-badge.webp`,
    email: `mailto:${settings.contactEmail}`,
    knowsAbout: [
      "Wildlife illustration",
      "Watercolour painting",
      "Children's book illustration",
      "Picture books",
      "Teaching material",
    ],
    worksFor: {
      "@type": "Organization",
      name: "the ground squirrel studio",
      url: `${SITE_URL}/studio/`,
      foundingDate: "2026",
      founder: { "@id": `${SITE_URL}/studio/#evelyne-buttet` },
    },
    sameAs: [settings.instagramUrl, settings.youtubeUrl, settings.tiktokUrl].filter(
      (url): url is string => Boolean(url) && !url!.includes("PLATZHALTER")
    ),
  };
}
