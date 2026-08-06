import Image from "next/image";
import Link from "next/link";
import { getPage } from "@/lib/content";

interface Settings {
  contactEmail: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
}

function isPlaceholder(value: string) {
  return !value || value.includes("PLATZHALTER");
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
    </svg>
  );
}

const EXPLORE = [
  { href: "/tour", label: "Tour" },
  { href: "/journal", label: "Journal" },
  { href: "/studio", label: "Studio" },
  { href: "/shop", label: "Shop" },
  { href: "/crew", label: "Crew" },
];

export default function SiteFooter() {
  const settings = getPage<Settings>("settings");

  const socials = [
    { url: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
    { url: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
  ].filter((s) => !isPlaceholder(s.url));

  return (
    <footer className="mt-28 bg-ink text-cream/70 sm:mt-36">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 sm:px-10">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10">
          {/* Who */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-3.5">
              <Image
                src="/images/brand/logo_notext.png"
                alt=""
                width={40}
                height={40}
                className="w-9 opacity-90"
              />
              <span className="text-[0.72rem] uppercase leading-tight tracking-[0.22em] text-cream">
                The Ground
                <br />
                Squirrel Café
              </span>
            </Link>
          </div>

          {/* Where to go */}
          <nav aria-label="Sections">
            <h2 className="eyebrow eyebrow-light">Explore</h2>
            <ul className="mt-6 space-y-3">
              {EXPLORE.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream/65 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* The small print */}
          <nav aria-label="Legal">
            <h2 className="eyebrow eyebrow-light">Legal</h2>
            <ul className="mt-6 space-y-3">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-cream/65 transition-colors hover:text-cream"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-cream/65 transition-colors hover:text-cream"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </nav>

          {/* How to reach us */}
          <div>
            <h2 className="eyebrow eyebrow-light">Get in touch</h2>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="link-underline mt-6 inline-block text-sm text-cream"
            >
              {settings.contactEmail}
            </a>

            {socials.length > 0 && (
              <div className="mt-7 flex items-center gap-3">
                {socials.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-colors hover:border-cream/60 hover:text-cream"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-cream/12 pt-8 text-[0.7rem] tracking-[0.1em] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Ground Squirrel Café</p>
          <p>
            with <span aria-hidden>🐿️</span>
            <span className="sr-only">love</span> by Evelyne and Frank
          </p>
        </div>
      </div>
    </footer>
  );
}
