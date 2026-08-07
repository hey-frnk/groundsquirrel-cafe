import type { MetadataRoute } from "next";
import {
  getAllJournalPosts,
  getAllShopProducts,
  getStudioProjects,
} from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

/**
 * Emitted as /sitemap.xml at build time — the export is static, so this runs
 * once during `next build` and ships as a plain file.
 *
 * Every URL carries a trailing slash because `trailingSlash: true` is what the
 * site actually serves. A sitemap that lists /journal while the site answers on
 * /journal/ hands Google two addresses for one page and lets it pick.
 */

// Pages that exist as their own route but should never be indexed: the
// thank-you page is a post-checkout receipt and /admin is the CMS shell.
const EXCLUDED = ["/shop/thank-you/", "/admin/"];

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/tour/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/studio/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/shop/", priority: 0.9, changeFrequency: "weekly" },
  { path: "/journal/", priority: 0.8, changeFrequency: "weekly" },
  { path: "/crew/", priority: 0.6, changeFrequency: "yearly" },
  { path: "/impressum/", priority: 0.2, changeFrequency: "yearly" },
  { path: "/datenschutz/", priority: 0.2, changeFrequency: "yearly" },
];

// `output: export` has no server to answer a request, so this metadata route
// has to declare that it is generated once at build time. Without it the build
// stops with "dynamic not configured on route".
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllJournalPosts();

  // The newest story is the best available answer to "when did this site last
  // change" for the pages that list it.
  const newestPost = posts[0]?.date ? new Date(posts[0].date) : new Date();

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: route.path === "/" || route.path === "/journal/" ? newestPost : undefined,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),

    ...posts.map((post) => ({
      url: `${SITE_URL}/journal/${post.slug}/`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),

    ...getAllShopProducts().map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...getStudioProjects().map((project) => ({
      url: `${SITE_URL}/studio/${project.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return entries.filter(
    (entry) => !EXCLUDED.some((path) => entry.url === `${SITE_URL}${path}`)
  );
}
