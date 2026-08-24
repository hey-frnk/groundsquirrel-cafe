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

/**
 * Groups consecutive single-image paragraphs (no caption, no other text between
 * them) into a responsive side-by-side grid, mirroring how these images were
 * grouped in the original Squarespace "gallery" blocks they were migrated from.
 * A single image followed by its own caption paragraph is left untouched.
 */
function wrapImageGalleries(htmlStr: string): string {
  const toGrid = (imgs: string[]) => {
    const cols = imgs.length >= 3 ? 3 : 2;
    return `<div class="img-gallery" style="--gallery-cols:${cols}">${imgs.join("")}</div>`;
  };
  // Consecutive image lines with no blank line between them become one <p>
  // containing multiple <img> tags (remark's soft-break behavior).
  let out = htmlStr.replace(/<p>((?:\s*<img[^>]*>\s*){2,})<\/p>/g, (_m, inner: string) =>
    toGrid(inner.match(/<img[^>]*>/g) ?? [])
  );
  // Consecutive image lines separated by blank lines become separate
  // <p><img></p> blocks in a row — group those too.
  out = out.replace(/(?:<p><img[^>]*><\/p>\s*){2,}/g, (run) => toGrid(run.match(/<img[^>]*>/g) ?? []));
  return out;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return wrapImageGalleries(processed.toString());
}

export interface JournalPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  cover: string;
  tags: string[];
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

export function getAllJournalPosts(): JournalPost[] {
  return readDir("journal")
    .map((filename) => {
      const { slug, data } = readEntry<JournalPost>("journal", filename);
      const size = measureCover(data.cover);
      return { ...data, slug, coverWidth: size?.width, coverHeight: size?.height };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getJournalPost(slug: string) {
  const { data, content } = readEntry<JournalPost>("journal", `${slug}.md`);
  const contentHtml = await markdownToHtml(content);
  return { ...data, slug, contentHtml };
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
    .filter((p): p is TourPhoto => Boolean(p?.image));
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
  order: number;
}

export function getAllCollabs(): (Collab & { description: string })[] {
  return readDir("collabs")
    .map((filename) => {
      const { slug, data, content } = readEntry<Collab>("collabs", filename);
      return {
        ...data,
        slug,
        // same shape as the tour stops, so a half-filled CMS row is dropped
        // rather than rendering an empty frame
        photos: normalizeTourPhotos(data.photos),
        description: content.trim(),
      };
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

function readStudioProject(filename: string): StudioProject {
  const { slug, data, content } = readEntry<StudioProject>("studio-projects", filename);
  return {
    ...data,
    slug,
    links: normalizeProjectLinks(data.links),
    gallery: normalizeProjectGallery(data.gallery),
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
