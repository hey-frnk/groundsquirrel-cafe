import type { Metadata } from "next";
import Script from "next/script";
import { DM_Serif_Display, Inter, Special_Elite } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/lib/cart";
import { SITE_URL } from "@/lib/seo";

// Headlines. A display face: soft round bowls, high contrast, one weight only —
// which is why nothing on the site ever asks a heading to be bold. The size is
// the emphasis.
const displaySerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-serif",
  display: "swap",
});

// Running text, labels, buttons — everything that has to be read rather than
// admired.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// The house typewriter, kept for the small letterspaced labels only. At that
// size it reads as a stamp pressed onto the page; set as body copy it read as a
// scrapbook.
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
});

const DESCRIPTION =
  "A café on wheels, an art studio, and a journal of the road, the ground squirrel café.";

export const metadata: Metadata = {
  // Without this, per-page Open Graph images resolve against localhost and
  // shared links show a broken preview.
  metadataBase: new URL(SITE_URL),
  // `%s` is filled in by each page's own title; the homepage uses `default`.
  title: {
    default: "The Ground Squirrel Café — a café, a studio and a journal on wheels",
    template: "%s — The Ground Squirrel Café",
  },
  description: DESCRIPTION,
  applicationName: "The Ground Squirrel Café",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // The site is mostly photographs and paintings; without this Google
      // shows them as thumbnails at best and often not at all.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "The Ground Squirrel Café",
    locale: "en_GB",
    url: SITE_URL,
    title: "The Ground Squirrel Café",
    description: DESCRIPTION,
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Humbär, a 1992 VW camper, parked on a clifftop above the sea with Evelyne and Frank beside it",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Ground Squirrel Café",
    description: DESCRIPTION,
    images: ["/images/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Browser extensions routinely add their own classes and attributes to
    // <html> before React hydrates, which React then reports as a mismatch
    // against the server's markup. Nothing in the app touches this element
    // after render, so the DOM is allowed to win here. The opt-out is one
    // element deep — real mismatches further down still surface.
    <html
      lang="en"
      className={`${displaySerif.variable} ${inter.variable} ${specialElite.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
      {/* 100% privacy-first analytics — cookieless, no personal data, EU-hosted.
          Counts page views only; see /datenschutz/. */}
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
