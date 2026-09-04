export function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="4" />
      <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
    </svg>
  );
}

/**
 * The two flags that mark a post as bilingual. Drawn rather than set as emoji:
 * Windows ships no colour flag glyphs at all and would render "US" and "CH" as
 * plain letters instead. The colours are pulled a little towards the paper the
 * site is printed on, so a flag does not shout next to a headline.
 */
function Flag({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 2) / 3)}
      viewBox="0 0 30 20"
      aria-hidden
      className="shrink-0 rounded-[2px] ring-1 ring-inset ring-ink/15"
    >
      {children}
    </svg>
  );
}

/** Stars and stripes, abbreviated: thirteen stripes, a plain union. */
export function UsFlag({ size = 18 }: { size?: number }) {
  const stripe = 20 / 13;
  return (
    <Flag size={size}>
      <rect width="30" height="20" fill="#f2ede3" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * stripe} width="30" height={stripe} fill="#b4503f" />
      ))}
      <rect width="13" height={stripe * 7} fill="#3d4a6b" />
    </Flag>
  );
}

export function ChFlag({ size = 18 }: { size?: number }) {
  return (
    <Flag size={size}>
      <rect width="30" height="20" fill="#b4503f" />
      <path d="M13.4 5h3.2v3.4H20v3.2h-3.4V15h-3.2v-3.4H10V8.4h3.4V5Z" fill="#f2ede3" />
    </Flag>
  );
}
