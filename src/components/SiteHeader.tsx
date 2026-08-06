"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartButton from "@/components/shop/CartButton";

const NAV_LINKS = [
  { href: "/tour", label: "Tour" },
  { href: "/journal", label: "Journal" },
  { href: "/studio", label: "Studio" },
  { href: "/shop", label: "Shop" },
  { href: "/crew", label: "Crew" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  // The bar is transparent over the top of a page and only earns its background
  // once the page has moved beneath it — so a masthead photograph is never cut
  // off by a band of colour that had nothing to sit on yet.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The homepage carries its own brand mark and navigation inside the intro
  // film, so the shared header would only duplicate it.
  if (isHome) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        lifted || open
          ? "border-b border-ink/10 bg-cream/92 backdrop-blur-md"
          : "border-b border-transparent bg-cream"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3.5">
          <Image
            src="/images/brand/logo_notext.png"
            alt="The Ground Squirrel Café"
            width={40}
            height={40}
            className="w-9"
          />
          <span className="hidden text-[0.72rem] uppercase leading-none tracking-[0.24em] text-ink sm:inline">
            The Ground Squirrel Café
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`link-underline text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-rose" : "text-ink/75 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span aria-hidden className="h-4 w-px bg-ink/15" />
          <CartButton />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <CartButton />
          <button
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span
              className={`block h-px w-5 bg-ink transition-transform duration-300 ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-ink transition-transform duration-300 ${
                open ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink/10 px-6 pb-6 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block border-b border-ink/8 py-3.5 text-[0.72rem] uppercase tracking-[0.2em] ${
                pathname.startsWith(link.href) ? "text-rose" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
