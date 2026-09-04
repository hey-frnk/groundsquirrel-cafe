import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { imageSize, type ImageDimensions } from "./imageSize";
import type { ShopProduct, ShopVariant } from "./shop";

export type { ShopProduct, ShopVariant } from "./shop";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDir(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".md"));
}

function readEntry<T extends object>(
  dir: string,
  filename: string
): { slug: string; data: T; content: string } {
  const full = path.join(CONTENT_DIR, dir, filename);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  return { slug: filename.replace(/\.md$/, ""), data: data as T, content };
}

/** One photo from the markdown, with the italic line that captions it. */
interface Photo {
  img: string;
  caption?: string;
  /** Set when the photo is meant to sit in the text, with words beside it. */
  float?: "left" | "right";
}

/** A paragraph holding nothing but photos and their captions. */
const PHOTO_PARAGRAPH = /^(?:\s|<img[^>]*>|<em>[^<]*<\/em>|<br\s*\/?>)+$/;

/** A photo is portrait when it is clearly taller than it is wide. */
function isPortrait(img: string): boolean {
  const size = measureImage(/src="([^"]*)"/.exec(img)?.[1]?.split("#")[0]);
  return !!size && size.height > size.width * 1.05;
}

/**
 * `![alt](/photo.webp#left)` asks for the photo to be set into the text with the
 * words running beside it, the way the Squarespace posts did with a half-width
 * image block. The marker rides along in the `src` because that survives both
 * the CMS and any markdown editor; browsers ignore the fragment on an image.
 */
function floatOf(img: string): Photo["float"] {
  const src = /src="([^"]*)"/.exec(img)?.[1] ?? "";
  if (src.endsWith("#left")) return "left";
  if (src.endsWith("#right")) return "right";
  return undefined;
}

/**
 * Reads a paragraph of photos onto the end of `photos`. An `<em>` captions the
 * photo before it — that is how a caption is written in these posts — and may
 * arrive in a paragraph of its own, which is why the list is carried in rather
 * than started fresh each time.
 */
function appendPhotos(inner: string, photos: Photo[]): void {
  for (const m of inner.matchAll(/<img[^>]*>|<em>([^<]*)<\/em>/g)) {
    const last = photos[photos.length - 1];
    if (m[0].startsWith("<img")) photos.push({ img: m[0], float: floatOf(m[0]) });
    else if (last && last.caption === undefined) last.caption = m[1];
  }
}

/** Whether this paragraph's italic line is a caption for the photo before it. */
function isLooseCaption(inner: string, photos: Photo[]): boolean {
  const last = photos[photos.length - 1];
  return !inner.includes("<img") && !!last && last.caption === undefined;
}

/**
 * Lays out a run of photos.
 *
 * Two or more uncaptioned photos in a row become a grid, mirroring the
 * Squarespace "gallery" blocks these posts were migrated from. Beyond that, two
 * portrait photos next to each other are set side by side: a tall photo alone
 * fills the column and pushes the story off the screen, so a run of them turns
 * the post into a slideshow. As a pair they take about the space of one
 * landscape photo, captions and all, and the reading keeps its flow.
 */
function layOutPhotos(photos: Photo[]): string {
  const grid = (cells: string[], cols: number, extra = "") =>
    `<div class="img-gallery${extra}" style="--gallery-cols:${cols}">${cells.join("")}</div>`;
  const figure = (p: Photo, className = "") =>
    `<figure${className ? ` class="${className}"` : ""}>${p.img}` +
    `${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}</figure>`;

  const parts: string[] = [];
  let i = 0;
  while (i < photos.length) {
    // A photo set into the text belongs to the words that follow it, so it is
    // never gathered into a grid or paired with its neighbour. It also needs
    // text to wrap around: with another photo right behind it there is nothing
    // to flow beside, and it goes back to being an ordinary photo.
    if (photos[i].float && i === photos.length - 1) {
      parts.push(figure(photos[i], `img-float is-${photos[i].float}`));
      i++;
      continue;
    }

    let plain = i;
    while (plain < photos.length && photos[plain].caption === undefined && !photos[plain].float)
      plain++;
    if (plain - i >= 2) {
      const run = photos.slice(i, plain);
      parts.push(grid(run.map((p) => p.img), run.length >= 3 ? 3 : 2));
      i = plain;
      continue;
    }

    const [first, second] = [photos[i], photos[i + 1]];
    if (second && !second.float && isPortrait(first.img) && isPortrait(second.img)) {
      parts.push(grid([figure(first), figure(second)], 2, " is-pair"));
      i += 2;
      continue;
    }

    parts.push(`<p class="img-single">${first.img}</p>`);
    if (first.caption) parts.push(`<p><em>${first.caption}</em></p>`);
    i++;
  }
  return parts.join("");
}

/**
 * Re-lays every stretch of photos in a rendered post. Photos reach us in two
 * shapes — one paragraph per photo, or several sharing a paragraph when the
 * markdown had no blank line between them — and both are read into the same
 * list first, so the layout does not depend on how the lines happened to be
 * typed. An italic line that is not a caption (a sign-off, say) ends the
 * stretch and is left exactly where it was.
 */
function wrapImageGalleries(htmlStr: string): string {
  const paragraphs = [...htmlStr.matchAll(/<p>([\s\S]*?)<\/p>/g)];

  const out: string[] = [];
  let cursor = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const first = paragraphs[i];
    if (!PHOTO_PARAGRAPH.test(first[1]) || !first[1].trimStart().startsWith("<img")) continue;

    const photos: Photo[] = [];
    appendPhotos(first[1], photos);

    // Take in every photo paragraph that follows with only whitespace between.
    let last = first;
    while (i + 1 < paragraphs.length) {
      const next = paragraphs[i + 1];
      const between = htmlStr.slice(last.index + last[0].length, next.index);
      const inner = next[1];
      const continues =
        !between.trim() &&
        PHOTO_PARAGRAPH.test(inner) &&
        (inner.includes("<img") || isLooseCaption(inner, photos));
      if (!continues) break;
      appendPhotos(inner, photos);
      last = next;
      i++;
    }

    out.push(htmlStr.slice(cursor, first.index));
    out.push(layOutPhotos(photos));
    cursor = last.index + last[0].length;
  }
  out.push(htmlStr.slice(cursor));
  return out.join("");
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Turns `[map:<my-maps-id>|Caption]` on its own line into a Google My Maps
 * embed that is *not* loaded yet: only a placeholder with a button. The iframe
 * is inserted by `MapEmbeds` once the reader asks for it, so nothing is
 * requested from Google — and no cookie of theirs can be set — unless the
 * reader chooses to load the map. That is what keeps this site free of a
 * consent banner; see the "Interactive maps" section of the privacy policy.
 */
function renderMapEmbeds(htmlStr: string): string {
  return htmlStr.replace(
    /<p>\[map:([A-Za-z0-9_-]+)(?:\|([^\]]*))?\]<\/p>/g,
    (_m, mid: string, caption = "") => {
      const label = escapeHtml(caption.trim() || "Interactive map");
      return (
        `<figure class="map-embed" data-map-embed="${escapeHtml(mid)}">` +
        `<div class="map-embed-frame" data-map-frame>` +
        `<div class="map-embed-consent">` +
        `<p class="map-embed-title">${label}</p>` +
        `<p class="map-embed-note">This map is hosted by Google. Loading it sends your IP address to Google and may allow Google to set cookies on your device. Nothing is sent until you click.</p>` +
        `<button type="button" data-map-load data-map-title="${label}">Load the interactive map</button>` +
        `<p class="map-embed-note"><a href="https://www.google.com/maps/d/u/0/embed?mid=${escapeHtml(mid)}&amp;ehbc=2E312F" target="_blank" rel="noopener noreferrer">Open the map at Google instead</a> · <a href="/datenschutz/">Privacy policy</a></p>` +
        `</div></div></figure>`
      );
    }
  );
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return renderMapEmbeds(wrapImageGalleries(processed.toString()));
}

/**
 * Categories and tags are typed by hand in the CMS, and the same label came out
 * of Squarespace in several spellings ("Big Five", "big five"). Lower-casing and
 * de-duplicating them here means one label is one filter, everywhere.
 */
function normalizeLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) return [];
  const seen = new Set<string>();
  return labels
    .map((l) => (typeof l === "string" ? l.trim().toLowerCase() : ""))
    .filter((l) => l && !seen.has(l) && seen.add(l));
}

export interface JournalPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  cover: string;
  /** Broad section the post belongs to ("travel", "thoughts", …). */
  categories: string[];
  tags: string[];
  /** True when a `<slug>.de.md` translation sits next to the post. */
  hasGerman?: boolean;
  /** Intrinsic size of `cover`, when it could be read — see `measureCover`. */
  coverWidth?: number;
  coverHeight?: number;
}

/**
 * The journal pinboard places covers in masonry columns at their own aspect
 * ratio, so it needs the intrinsic size up front to reserve the space; without
 * it the columns reshuffle as each photo lands.
 */
function measureCover(cover?: string): ImageDimensions | undefined {
  if (!cover?.startsWith("/")) return undefined;
  return imageSize(path.join(process.cwd(), "public", cover));
}

/**
 * A German version of a post lives in `content/journal-de/` under the very same
 * slug, and holds only a title, an excerpt and the translated body — date,
 * cover, categories and tags stay with the English post and are never repeated.
 * Its own folder (rather than a `.de.md` beside the post) keeps it out of the
 * journal listing and gives the CMS a collection of its own. A post with no such
 * file is simply English only; there is no half-translated state to handle.
 */
function germanPath(slug: string) {
  return path.join(CONTENT_DIR, "journal-de", `${slug}.md`);
}

export interface GermanVersion {
  title: string;
  excerpt?: string;
  contentHtml: string;
}

async function readGermanVersion(slug: string): Promise<GermanVersion | undefined> {
  const full = germanPath(slug);
  if (!fs.existsSync(full)) return undefined;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    title: (data.title as string) ?? "",
    excerpt: data.excerpt as string | undefined,
    contentHtml: await markdownToHtml(content),
  };
}

export function getAllJournalPosts(): JournalPost[] {
  return readDir("journal")
    .map((filename) => {
      const { slug, data } = readEntry<JournalPost>("journal", filename);
      const size = measureCover(data.cover);
      return {
        ...data,
        slug,
        categories: normalizeLabels(data.categories),
        tags: normalizeLabels(data.tags),
        hasGerman: fs.existsSync(germanPath(slug)),
        coverWidth: size?.width,
        coverHeight: size?.height,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getJournalPost(slug: string) {
  const { data, content } = readEntry<JournalPost>("journal", `${slug}.md`);
  const contentHtml = await markdownToHtml(content);
  return {
    ...data,
    slug,
    categories: normalizeLabels(data.categories),
    tags: normalizeLabels(data.tags),
    contentHtml,
    german: await readGermanVersion(slug),
  };
}

/**
 * Every category in use, in the order the journal wants to offer them. Derived
 * from the posts, so a category the CMS offers (vanlife, say) joins the filter
 * row by itself the moment the first post is filed under it — and leaves again
 * when the last one goes.
 */
export function getJournalCategories(): string[] {
  const counts = new Map<string, number>();
  for (const post of getAllJournalPosts()) {
    for (const category of post.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  // Busiest first, so "travel" leads and a one-off category doesn't open the row.
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category]) => category);
}

/** The person behind a post, as the crew page already describes them. */
export interface JournalAuthor {
  /** The name as the posts spell it — "Frank", "Evelyne". */
  author: string;
  /** Their entry on the crew page, for the link to the longer story. */
  slug: string;
  name: string;
  role: string;
  photo: string;
  /** The opening sentence of their crew entry, enough to say who they are. */
  excerpt: string;
}

/**
 * Pairs the author of a post with their crew entry. Posts carry a first name
 * and the crew a full one, so the first name is what matches; an author with no
 * crew entry simply has no card, and the post still reads fine without one.
 */
export function getJournalAuthor(author: string): JournalAuthor | undefined {
  const wanted = author.trim().toLowerCase();
  for (const filename of readDir("crew")) {
    const { slug, data, content } = readEntry<CrewMember>("crew", filename);
    if (!data.name?.toLowerCase().startsWith(wanted)) continue;
    const [opening] = content.trim().split(/(?<=\.)\s/);
    return {
      author: author.trim(),
      slug,
      name: data.name,
      role: data.role,
      photo: data.photo,
      excerpt: opening,
    };
  }
  return undefined;
}

export interface CrewMember {
  slug: string;
  name: string;
  role: string;
  photo: string;
  photos?: string[];
  order: number;
  spiritAnimal?: string;
  inspiredBy?: string;
  fieldOfWork?: string[];
  qualifications?: string[];
}

// The CMS list widget can store each entry either as a plain string or as
// { image: "..." } depending on how it's configured — accept both.
function normalizePhotos(photos: unknown): string[] | undefined {
  if (!Array.isArray(photos)) return undefined;
  return photos
    .map((p) => (typeof p === "string" ? p : (p as { image?: string })?.image))
    .filter((p): p is string => Boolean(p));
}

export async function getAllCrewMembers(): Promise<(CrewMember & { contentHtml: string })[]> {
  const entries = readDir("crew").map((filename) => {
    const { slug, data, content } = readEntry<CrewMember>("crew", filename);
    return { ...data, slug, content, photos: normalizePhotos(data.photos) };
  });
  entries.sort((a, b) => a.order - b.order);
  return Promise.all(
    entries.map(async (e) => ({
      ...e,
      contentHtml: await markdownToHtml(e.content),
    }))
  );
}

function normalizeVariants(variants: unknown): ShopVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants
    .filter((v): v is ShopVariant => Boolean(v) && typeof (v as ShopVariant).label === "string")
    .map((v) => ({ ...v, price: Number(v.price) || 0, images: normalizePhotos(v.images) }));
}

function readShopProduct(filename: string) {
  const { slug, data, content } = readEntry<ShopProduct>("shop", filename);
  return {
    ...data,
    slug,
    body: content.trim(),
    gallery: normalizePhotos(data.gallery),
    variants: normalizeVariants(data.variants),
  };
}

export function getAllShopProducts(): (ShopProduct & { body: string })[] {
  return readDir("shop")
    .map(readShopProduct)
    .sort((a, b) => a.order - b.order);
}

export async function getShopProduct(slug: string) {
  const product = readShopProduct(`${slug}.md`);
  return { ...product, bodyHtml: await markdownToHtml(product.body) };
}

export interface TourPhoto {
  image: string;
  caption?: string;
  width?: number;
  height?: number;
}

/** Intrinsic size of a public-folder image, for layouts that must not crop. */
export function measureImage(image?: string): ImageDimensions | undefined {
  if (!image?.startsWith("/")) return undefined;
  return imageSize(path.join(process.cwd(), "public", image));
}

export interface TourStop {
  slug: string;
  country: string;
  place?: string;
  tagline?: string;
  treat?: string;
  photo: string;
  photos?: TourPhoto[];
  order: number;
}

// Photos are entered in the CMS as a list of { image, caption } objects, but an
// older/simpler entry may still be a plain image path — accept both, and drop
// entries without an image so a half-filled CMS row can't break the page.
function normalizeTourPhotos(photos: unknown): TourPhoto[] {
  if (!Array.isArray(photos)) return [];
  return photos
    .map((p) => (typeof p === "string" ? { image: p } : (p as TourPhoto)))
    .filter((p): p is TourPhoto => Boolean(p?.image))
    .map((p) => ({ ...p, ...measureImage(p.image) }));
}

export function getAllTourStops(): (TourStop & { description: string })[] {
  return readDir("tour-stops")
    .map((filename) => {
      const { slug, data, content } = readEntry<TourStop>("tour-stops", filename);
      return {
        ...data,
        slug,
        photos: normalizeTourPhotos(data.photos),
        description: content.trim(),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export interface CollabPhoto {
  image: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Collab {
  slug: string;
  partner: string;
  title: string;
  format?: string;
  year?: string;
  image: string;
  imageAlt?: string;
  photos?: CollabPhoto[];
  link?: string;
  /** The reel the collaboration was published as, on Instagram. */
  reel?: string;
  order: number;
}

/**
 * The lead photo and the extra ones are laid out as a single justified row, so
 * they are merged into one list here and each measured. The row scales every
 * photo to a common height from its own aspect ratio, which means none of them
 * has to be cropped to fit — but it can only do that if the intrinsic sizes are
 * known before the browser has the files.
 */
function collabGallery(data: Collab): CollabPhoto[] {
  const extras = normalizeTourPhotos(data.photos);
  return [{ image: data.image, caption: data.imageAlt }, ...extras]
    .filter((photo) => Boolean(photo.image))
    .map((photo) => {
      return { ...photo, ...measureImage(photo.image) };
    });
}

export function getAllCollabs(): (Collab & { description: string; gallery: CollabPhoto[] })[] {
  return readDir("collabs")
    .map((filename) => {
      const { slug, data, content } = readEntry<Collab>("collabs", filename);
      return { ...data, slug, gallery: collabGallery(data), description: content.trim() };
    })
    .sort((a, b) => a.order - b.order);
}

export interface StudioItem {
  slug: string;
  title: string;
  image: string;
  order: number;
  link?: string;
  edukiLink?: string;
}

export interface StudioPortfolioItem extends StudioItem {
  description: string;
  /** Intrinsic size, so the masonry can reserve each frame before it loads. */
  width?: number;
  height?: number;
}

export function getStudioPortfolio(): StudioPortfolioItem[] {
  return readDir("studio-portfolio")
    .map((filename) => {
      const { slug, data, content } = readEntry<StudioItem>("studio-portfolio", filename);
      const size = data.image?.startsWith("/")
        ? imageSize(path.join(process.cwd(), "public", data.image))
        : undefined;
      return {
        ...data,
        slug,
        description: content.trim(),
        width: size?.width,
        height: size?.height,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export interface StudioProjectLink {
  label: string;
  url: string;
}

export interface StudioProjectPlate {
  image: string;
  caption?: string;
}

/** One row of the "Angaben" panel, e.g. Verlag / St. Benno Verlag. */
export interface StudioProjectDetail {
  label: string;
  value: string;
}

export interface StudioProject extends StudioItem {
  /** One-line note under the title, e.g. "Veröffentlichung: September 2026". */
  status?: string;
  subtitle?: string;
  /** Small label on the carousel card, e.g. "Buch". */
  kind?: string;
  /** Card text on the carousel — the longer story lives in the body. */
  teaser?: string;
  /** Where the piece can be bought or borrowed, shown under the buttons. */
  availability?: string;
  /** Language of the body text, when it isn't the site's English. */
  lang?: string;
  /** Short selling points, set above the body text. */
  highlights: string[];
  /** Publisher's data — ISBN, format, pages — as a labelled panel. */
  details: StudioProjectDetail[];
  /**
   * The masthead names Evelyne as the illustrator by default. Projects that
   * spell their credits out themselves (in `details`) set this, so the line
   * isn't said twice.
   */
  hideCredit?: boolean;
  links: StudioProjectLink[];
  gallery: StudioProjectPlate[];
  /** Stands in while the illustration series for a project is still coming. */
  galleryNote?: string;
  infoNote?: string;
  description: string;
}

// Both lists come from the CMS, where a half-filled row is normal while a
// project is still being written — drop anything without its essential field
// rather than rendering an empty button or a broken frame.
function normalizeProjectLinks(links: unknown): StudioProjectLink[] {
  if (!Array.isArray(links)) return [];
  return links.filter(
    (l): l is StudioProjectLink => Boolean((l as StudioProjectLink)?.label && (l as StudioProjectLink)?.url)
  );
}

function normalizeProjectGallery(plates: unknown): StudioProjectPlate[] {
  if (!Array.isArray(plates)) return [];
  return plates
    .map((p) => (typeof p === "string" ? { image: p } : (p as StudioProjectPlate)))
    .filter((p): p is StudioProjectPlate => Boolean(p?.image));
}

function normalizeProjectHighlights(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => (typeof i === "string" ? i : (i as { text?: string })?.text))
    .filter((i): i is string => Boolean(i?.trim()));
}

function normalizeProjectDetails(rows: unknown): StudioProjectDetail[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (r): r is StudioProjectDetail =>
      Boolean((r as StudioProjectDetail)?.label && (r as StudioProjectDetail)?.value)
  );
}

function readStudioProject(filename: string): StudioProject {
  const { slug, data, content } = readEntry<StudioProject>("studio-projects", filename);
  return {
    ...data,
    slug,
    links: normalizeProjectLinks(data.links),
    gallery: normalizeProjectGallery(data.gallery),
    highlights: normalizeProjectHighlights(data.highlights),
    details: normalizeProjectDetails(data.details),
    description: content.trim(),
  };
}

export function getStudioProjects(): StudioProject[] {
  return readDir("studio-projects")
    .map(readStudioProject)
    .sort((a, b) => a.order - b.order);
}

export async function getStudioProject(slug: string) {
  const project = readStudioProject(`${slug}.md`);
  return { ...project, descriptionHtml: await markdownToHtml(project.description) };
}

export function getStudioTeaching(): (StudioItem & { description: string })[] {
  return readDir("studio-teaching")
    .map((filename) => {
      const { slug, data, content } = readEntry<StudioItem>("studio-teaching", filename);
      return { ...data, slug, description: content.trim() };
    })
    .sort((a, b) => a.order - b.order);
}

export function getPage<T extends object>(name: string) {
  const { data, content } = readEntry<T>("pages", `${name}.md`);
  return { ...data, content: content.trim() };
}
