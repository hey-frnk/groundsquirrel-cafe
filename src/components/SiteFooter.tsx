import Link from "next/link";
import { getPage } from "@/lib/content";

interface Settings {
  tagline: string;
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
    </svg>
  );
}

export default function SiteFooter() {
  const settings = getPage<Settings>("settings");

  const socials = [
    { url: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
    { url: settings.tiktokUrl, label: "TikTok", Icon: TiktokIcon },
  ].filter((s) => !isPlaceholder(s.url));

  return (
    <footer className="bg-ivory border-t border-ink/10 mt-16">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-5">
          {socials.length > 0 ? (
            socials.map(({ url, label, Icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-ink transition-colors hover:text-rose"
              >
                <Icon />
              </a>
            ))
          ) : (
            <span className="text-xs text-ink/50">
              [Social-Media-Links noch nicht eingetragen — im CMS unter &ldquo;Settings&rdquo; ergänzen]
            </span>
          )}
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/impressum" className="hover:text-rose transition-colors">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-rose transition-colors">
            Datenschutz
          </Link>
          <a
            href={`mailto:${settings.contactEmail}`}
            className="hover:text-rose transition-colors"
          >
            Contact
          </a>
        </nav>

        <p className="text-xs text-ink/60">
          © {new Date().getFullYear()} the ground squirrel café — with 🐿️ by evelyne &amp; frank
        </p>
      </div>
    </footer>
  );
}
