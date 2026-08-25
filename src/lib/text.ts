/**
 * Headlines and intros are written in the CMS, where the natural way to ask for
 * a line break is either a real newline or a typed <br>. Neither survives as-is
 * in JSX, so split on both and let the caller render the parts as blocks — no
 * raw HTML from content has to be trusted.
 */
export function splitLines(text: string): string[] {
  return text.split(/\s*(?:<br\s*\/?>|\n)\s*/).filter(Boolean);
}
