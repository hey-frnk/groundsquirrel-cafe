import type { Metadata } from "next";
import { Special_Elite } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import { CartProvider } from "@/lib/cart";

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
    <html lang="en" className={`${specialElite.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased tracking-wide">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
