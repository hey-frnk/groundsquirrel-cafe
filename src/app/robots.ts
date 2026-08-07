import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Emitted as /robots.txt at build time.
 *
 * Everything is open except three routes that would only waste crawl budget or
 * put a receipt into the index. The `noindex` meta tags on those pages are the
 * real guard — a Disallow only stops the crawl, and a page that is never
 * crawled can still be indexed from an inbound link. Both together is the
 * belt-and-braces version.
 */
// `output: export` has no server to answer a request, so this metadata route
// has to declare that it is generated once at build time. Without it the build
// stops with "dynamic not configured on route".
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/shop/thank-you/", "/fonts/", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
