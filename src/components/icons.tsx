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
 * Windows ships no color flag glyphs at all and would render "US" and "CH" as
 * plain letters instead. The colors are pulled a little toward the paper the
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

/* The places a story gets passed on to. Drawn in the same single-weight line as
   the icons above, so a row of them reads as one set. */

export function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14.5 8.5V6.8c0-.7.4-1.1 1.2-1.1H17V3h-2c-2.2 0-3.4 1.3-3.4 3.5v2h-2V11h2v10h2.9V11h2.2l.4-2.5h-2.6Z" />
    </svg>
  );
}

export function XIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 4l7.2 9.3L4.4 20" />
      <path d="M20 20l-7.2-9.3L19.6 4" />
    </svg>
  );
}

export function PinterestIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3a7 7 0 0 0-2.6 13.5" />
      <path d="M12 3a7 7 0 0 1 .6 14" />
      <path d="M12.6 17c-1 0-1.9-.5-2.3-1.3" />
      <path d="M11.6 10.5 9.4 21" />
      <path d="M11.4 12.3c.3.9 1.1 1.4 2 1.4 1.7 0 2.9-1.6 2.9-3.7 0-2-1.6-3.4-3.7-3.4-2.5 0-4.1 1.7-4.1 3.7 0 .9.3 1.7.9 2.2" />
    </svg>
  );
}

export function WhatsappIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M4 20l1.2-3.7A8 8 0 1 1 8.3 19L4 20Z" />
      <path d="M9.2 9c.3 1.6 1.4 3.5 3.2 4.6.6.4 1.3.6 1.9.7l.8-1.2 1.6.8-.5 1.3c-1.6.5-3.7-.5-5.3-1.9-1.4-1.2-2.4-2.9-2.6-4.2l1.2-.7.8 1.6L9.2 9Z" />
    </svg>
  );
}

export function MailIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7.5 7.1 5a1.5 1.5 0 0 0 1.8 0l7.1-5" />
    </svg>
  );
}
