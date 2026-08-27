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
  // The tour page opens on a full-bleed film, so the bar rides on top of it
  // rather than pushing it down: transparent, cream lettering, and it scrolls
  // away with the hero the way the homepage nav does.
  const overlay = pathname.startsWith("/tour");
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
      className={
        overlay
          ? `absolute inset-x-0 top-0 z-50 transition-colors duration-500 ${
              open ? "bg-ink/90 backdrop-blur-md" : "bg-transparent"
            }`
          : `sticky top-0 z-50 transition-colors duration-500 ${
              lifted || open
                ? "border-b border-ink/10 bg-cream/92 backdrop-blur-md"
                : "border-b border-transparent bg-cream"
            }`
      }
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
          <span
            className={`hidden text-[0.72rem] uppercase leading-none tracking-[0.24em] sm:inline ${
              overlay ? "text-cream drop-shadow" : "text-ink"
            }`}
          >
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
                  overlay
                    ? `drop-shadow ${active ? "text-rose" : "text-cream/85 hover:text-cream"}`
                    : active
                      ? "text-rose"
                      : "text-ink/75 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span aria-hidden className={`h-4 w-px ${overlay ? "bg-cream/30" : "bg-ink/15"}`} />
          <CartButton className={overlay ? "text-cream!" : ""} />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <CartButton className={overlay ? "text-cream!" : ""} />
          <button
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span
              className={`block h-px w-5 transition-transform duration-300 ${
                overlay ? "bg-cream" : "bg-ink"
              } ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 transition-transform duration-300 ${
                overlay ? "bg-cream" : "bg-ink"
              } ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          className={`px-6 pb-6 pt-2 md:hidden ${
            overlay ? "border-t border-cream/15" : "border-t border-ink/10"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3.5 text-[0.72rem] uppercase tracking-[0.2em] ${
                overlay ? "border-b border-cream/12" : "border-b border-ink/8"
              } ${
                pathname.startsWith(link.href)
                  ? "text-rose"
                  : overlay
                    ? "text-cream"
                    : "text-ink"
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
