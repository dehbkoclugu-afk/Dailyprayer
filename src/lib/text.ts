/** Small text helpers shared by editorial layouts. */

const LEADING_PUNCTUATION = /^[\p{P}\p{Z}]+/u;
const COMBINING = /^\p{M}$/u;

/**
 * Split text for an editorial drop cap without breaking surrogate pairs or
 * combining marks, and without enlarging an opening quotation mark.
 */
export function splitDropCap(text: string): { lead: string; cap: string; rest: string } {
  const lead = text.match(LEADING_PUNCTUATION)?.[0] ?? '';
  const chars = Array.from(text.slice(lead.length));
  if (!chars.length) return { lead: '', cap: '', rest: text };
  let end = 1;
  while (end < chars.length && COMBINING.test(chars[end])) end++;
  return { lead, cap: chars.slice(0, end).join(''), rest: chars.slice(end).join('') };
}

/** Truncate by code points (never splitting an emoji or accented letter). */
export function truncate(text: string, max: number): string {
  const chars = Array.from(text);
  return chars.length > max ? `${chars.slice(0, max).join('').trimEnd()}…` : text;
}
