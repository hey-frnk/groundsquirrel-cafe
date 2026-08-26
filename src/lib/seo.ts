import { getPage } from "./content";

export const SITE_URL = "https://thegroundsquirrel.cafe";

interface Settings {
  contactEmail: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

/** The social profiles that are actually filled in. */
function socialProfiles(settings: Settings): string[] {
  return [settings.instagramUrl, settings.youtubeUrl, settings.tiktokUrl].filter(
    (url): url is string => Boolean(url) && !url!.includes("PLATZHALTER")
  );
}

/**
 * The café itself, as an organisation.
 *
 * Given a stable `@id` so that every other block on the site — a blog post's
 * publisher, a product's seller — can point at this one node instead of
 * restating it. Search engines then read one organisation, not five.
 */
export function organization() {
  const settings = getPage<Settings>("settings");

  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "The Ground Squirrel Café",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/brand/logo_badge.png`,
      width: 1190,
      height: 1200,
    },
    image: `${SITE_URL}/images/og-default.jpg`,
    description:
      "A café on wheels, an art studio and a journal of the road, run by Evelyne Buttet and Frank Zheng from a self-built 1992 VW LT camper.",
    email: `mailto:${settings.contactEmail}`,
    founder: [{ "@id": `${SITE_URL}/studio/#evelyne-buttet` }],
    sameAs: socialProfiles(settings),
  };
}

/** The site as a whole, so a search engine has one node for "this website". */
export function webSite() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "The Ground Squirrel Café",
    inLanguage: "en-GB",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
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
    sameAs: socialProfiles(settings),
  };
}

/**
 * Structured data for Frank Zheng.
 *
 * Same reasoning as `evelynePerson`: one node, one `@id`, so the crew page and
 * the journal by-lines are read as the same person rather than three.
 */
export function frankPerson() {
  const settings = getPage<Settings>("settings");

  return {
    "@type": "Person",
    "@id": `${SITE_URL}/crew/#frank-zheng`,
    name: "Frank Zheng",
    givenName: "Frank",
    familyName: "Zheng",
    jobTitle: "Engineer, barista & photographer",
    description:
      "Frank Zheng is a Swiss electrical engineer who converted a 1992 VW LT camper into a solar-powered café and photographs the road it travels.",
    url: `${SITE_URL}/crew/`,
    email: `mailto:${settings.contactEmail}`,
    knowsAbout: ["Van conversion", "Solar power", "Specialty coffee", "Photography"],
    worksFor: { "@id": `${SITE_URL}/#organization` },
    sameAs: socialProfiles(settings),
  };
}

/**
 * What a brand can actually commission: content made on the road, either for
 * our own channels or handed over for theirs. Declared as a Service so that the
 * collaboration page is legible as an offer and not just as a photo essay.
 */
export function collaborationService() {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}/tour/#collaboration`,
    name: "Brand collaborations and content creation",
    serviceType: "Content creation, product placement and UGC",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: ["Switzerland", "Germany", "Austria", "Europe"],
    availableLanguage: ["de", "en"],
    description:
      "Product placement, campfire sessions, pop-up café days and destination storytelling, filmed on the road in a 1992 VW camper. Reels, photography and journal writing for a brand's own channels or ours, in German and English.",
    url: `${SITE_URL}/tour/`,
  };
}
