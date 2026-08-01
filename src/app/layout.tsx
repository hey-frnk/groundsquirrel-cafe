import type { Metadata } from "next";
import { Special_Elite } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
});

export const metadata: Metadata = {
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
