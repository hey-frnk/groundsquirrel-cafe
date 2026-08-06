import type { Metadata } from "next";
import Script from "next/script";
import { DM_Serif_Display, Inter, Special_Elite } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/lib/cart";

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

export const metadata: Metadata = {
  // Without this, per-page Open Graph images resolve against localhost and
  // shared links show a broken preview.
  metadataBase: new URL("https://thegroundsquirrel.cafe"),
  title: "The Ground Squirrel Café",
  description:
    "A café on wheels, an art studio, and a journal of the road — the ground squirrel café.",
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
