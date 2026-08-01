import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

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

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

export interface JournalPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  cover: string;
  tags: string[];
}

export function getAllJournalPosts(): JournalPost[] {
  return readDir("journal")
    .map((filename) => {
      const { slug, data } = readEntry<JournalPost>("journal", filename);
      return { ...data, slug };
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
  order: number;
  spiritAnimal?: string;
  inspiredBy?: string;
  fieldOfWork?: string[];
  qualifications?: string[];
}

export async function getAllCrewMembers(): Promise<(CrewMember & { contentHtml: string })[]> {
  const entries = readDir("crew").map((filename) => {
    const { slug, data, content } = readEntry<CrewMember>("crew", filename);
    return { ...data, slug, content };
  });
  entries.sort((a, b) => a.order - b.order);
  return Promise.all(
    entries.map(async (e) => ({
      ...e,
      contentHtml: await markdownToHtml(e.content),
    }))
  );
}

export interface ShopProduct {
  slug: string;
  title: string;
  price: string;
  image: string;
  stripeLink: string;
  order: number;
}

export function getAllShopProducts(): (ShopProduct & { description: string })[] {
  return readDir("shop")
    .map((filename) => {
      const { slug, data, content } = readEntry<ShopProduct>("shop", filename);
      return { ...data, slug, description: content.trim() };
    })
    .sort((a, b) => a.order - b.order);
}

export interface TourStop {
  slug: string;
  location: string;
  date: string;
  photo: string;
  order: number;
}

export function getAllTourStops(): (TourStop & { description: string })[] {
  return readDir("tour-stops")
    .map((filename) => {
      const { slug, data, content } = readEntry<TourStop>("tour-stops", filename);
      return { ...data, slug, description: content.trim() };
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

export function getStudioPortfolio(): (StudioItem & { description: string })[] {
  return readDir("studio-portfolio")
    .map((filename) => {
      const { slug, data, content } = readEntry<StudioItem>("studio-portfolio", filename);
      return { ...data, slug, description: content.trim() };
    })
    .sort((a, b) => a.order - b.order);
}

export function getStudioProjects(): (StudioItem & { description: string })[] {
  return readDir("studio-projects")
    .map((filename) => {
      const { slug, data, content } = readEntry<StudioItem>("studio-projects", filename);
      return { ...data, slug, description: content.trim() };
    })
    .sort((a, b) => a.order - b.order);
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
