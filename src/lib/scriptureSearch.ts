import type { FullBook } from '@/data/bibleFull';

export interface ScriptureSearchHit {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  text: string;
  at: number;
}

interface VersePointer {
  book: number;
  chapter: number;
  verse: number;
}

export interface ScriptureSearchIndex {
  locale: string;
  bible: FullBook[];
  verses: VersePointer[];
  bigrams: Map<string, number[]>;
}

type YieldControl = () => Promise<void>;

const defaultYield: YieldControl = () => new Promise((resolve) => setTimeout(resolve, 0));
const indexCache = new WeakMap<FullBook[], Map<string, Promise<ScriptureSearchIndex>>>();

export function normalizeScriptureQuery(value: string, locale: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase(locale);
}

function uniqueBigrams(value: string): string[] {
  if (value.length < 2) return [];
  const grams = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    grams.add(value.slice(index, index + 2));
  }
  return [...grams];
}

/**
 * Builds a locale-scoped inverted index cooperatively. Work is yielded every
 * chapter so opening Search never monopolises the JS event loop on low-end
 * Android devices. Scripture strings are referenced, never copied or changed.
 */
export async function buildScriptureSearchIndex(
  bible: FullBook[],
  locale: string,
  yieldControl: YieldControl = defaultYield,
): Promise<ScriptureSearchIndex> {
  const verses: VersePointer[] = [];
  const bigrams = new Map<string, number[]>();

  for (let book = 0; book < bible.length; book += 1) {
    for (let chapter = 0; chapter < bible[book].chapters.length; chapter += 1) {
      const rows = bible[book].chapters[chapter];
      for (let verse = 0; verse < rows.length; verse += 1) {
        const id = verses.length;
        verses.push({ book, chapter, verse });
        const searchable = rows[verse][1].toLocaleLowerCase(locale);
        for (const gram of uniqueBigrams(searchable)) {
          const posting = bigrams.get(gram);
          if (posting) posting.push(id);
          else bigrams.set(gram, [id]);
        }
      }
      await yieldControl();
    }
  }

  return { locale, bible, verses, bigrams };
}

/** Reuses one cooperative index build for every screen visit in the active locale. */
export function getScriptureSearchIndex(
  bible: FullBook[],
  locale: string,
): Promise<ScriptureSearchIndex> {
  let byLocale = indexCache.get(bible);
  if (!byLocale) {
    byLocale = new Map();
    indexCache.set(bible, byLocale);
  }
  const existing = byLocale.get(locale);
  if (existing) return existing;
  const pending = buildScriptureSearchIndex(bible, locale);
  byLocale.set(locale, pending);
  pending.catch(() => byLocale?.delete(locale));
  return pending;
}

/** Queries the smallest posting list, then verifies exact substring matches. */
export function searchScriptureIndex(
  index: ScriptureSearchIndex,
  query: string,
  options: { max?: number; includesBook?: (book: number) => boolean } = {},
): ScriptureSearchHit[] {
  const needle = normalizeScriptureQuery(query, index.locale);
  if (needle.length < 2) return [];
  const postings = uniqueBigrams(needle)
    .map((gram) => index.bigrams.get(gram) ?? [])
    .sort((left, right) => left.length - right.length);
  if (!postings.length || postings[0].length === 0) return [];

  const max = options.max ?? 300;
  const hits: ScriptureSearchHit[] = [];
  for (const id of postings[0]) {
    const pointer = index.verses[id];
    if (options.includesBook && !options.includesBook(pointer.book)) continue;
    const book = index.bible[pointer.book];
    const row = book.chapters[pointer.chapter][pointer.verse];
    const at = row[1].toLocaleLowerCase(index.locale).indexOf(needle);
    if (at === -1) continue;
    hits.push({
      ...pointer,
      ref: `${book.name} ${pointer.chapter + 1}:${row[0]}`,
      text: row[1],
      at,
    });
    if (hits.length >= max) break;
  }
  return hits;
}
