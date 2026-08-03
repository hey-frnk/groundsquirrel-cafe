"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

  if (isHome) {
    return (
      <header className="flex flex-col items-center justify-center py-7 sm:py-9">
        <Image
          src="/images/brand/logo_badge_var.png"
          alt="The Ground Squirrel Café"
          width={165}
          height={240}
          preload
        />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-ink/10">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/brand/logo_notext.png"
            alt="The Ground Squirrel Café"
            width={44}
            height={44}
          />
          <span className="hidden sm:inline text-sm sm:text-base">
            the ground squirrel café
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-rose ${
                pathname.startsWith(link.href) ? "text-rose" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-sm border border-ink/30 rounded px-3 py-1.5"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-5 pb-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-2 border-b border-ink/10 ${
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
