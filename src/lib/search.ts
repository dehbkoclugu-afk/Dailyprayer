/**
 * Accent-, case- and dotted/dotless-i–insensitive text matching for Scripture
 * search, with a mapping back to the original string so the highlighted match
 * is always the exact span the user sees (folding can change string length).
 */

const MARKS = /\p{M}/gu;
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

function foldChar(char: string, locale: string): string {
  let lower: string;
  try {
    lower = char.toLocaleLowerCase(locale);
  } catch {
    lower = char.toLowerCase();
  }
  return lower.normalize('NFD').replace(MARKS, '').replace(/ı/g, 'i').replace(/ß/g, 'ss');
}

/** Folded text used for matching. */
export function foldForSearch(text: string, locale: string): string {
  let out = '';
  for (const char of text) out += foldChar(char, locale);
  return out;
}

/** Locate `needle` (already folded) in `text`, returning original-string offsets. */
export function findMatch(
  text: string,
  foldedText: string,
  foldedNeedle: string,
  locale: string,
): { start: number; end: number } | null {
  const at = foldedText.indexOf(foldedNeedle);
  if (at < 0 || !foldedNeedle) return null;
  // Walk the original string, tracking how far each char advances the fold.
  let folded = 0;
  let start = -1;
  let index = 0;
  for (const char of text) {
    const width = foldChar(char, locale).length;
    if (start < 0 && folded + width > at) start = index;
    folded += width;
    index += char.length;
    if (start >= 0 && folded >= at + foldedNeedle.length) return { start, end: index };
  }
  return start >= 0 ? { start, end: text.length } : null;
}

/** CJK queries are meaningful from one character; others need two. */
export function minimumQueryLength(query: string): number {
  return CJK.test(query) ? 1 : 2;
}
