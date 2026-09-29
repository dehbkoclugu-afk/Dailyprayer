import { readFileSync, writeFileSync } from 'node:fs';

const verses = readFileSync(new URL('../src/data/verses.ts', import.meta.url), 'utf8');
const pool = JSON.parse(verses.match(/const versePool: PoolEntry\[\] = (\[.*\]);/s)?.[1] ?? '[]');
const names = JSON.parse(readFileSync(new URL('../src/data/bible-book-names.json', import.meta.url), 'utf8'));
const codes = new Map(Object.entries(names).map(([code, translations]) => [translations.en, code]));
codes.set('Psalm', 'PSA');
const englishBible = JSON.parse(readFileSync(new URL('../src/data/bible-full.en.json', import.meta.url), 'utf8'));
const englishPsalms = englishBible.books.find((book) => book.code === 'PSA');
const rows = pool.map((entry) => {
  const match = entry.reference.en.match(/^(.*?) (\d+):(\d+)(?:-(\d+))?$/);
  if (!match) throw new Error(`Unparsed reference: ${entry.reference.en}`);
  const [, name, chapter, start, end] = match;
  const code = codes.get(name);
  if (!code) throw new Error(`Unknown book: ${name}`);
  const englishEnd = code === 'PSA'
    ? Math.max(...englishPsalms.chapters[Number(chapter) - 1].flatMap(([label]) => label.match(/\d+/g)?.map(Number) ?? []))
    : 0;
  return [code, Number(chapter), Number(start), Number(end ?? start), entry.theme, englishEnd];
});
if (rows.length < 365) throw new Error('Expected a complete year of references');

const source = `/** Curated daily references resolved against an installed Bible language pack. */
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import type { BiblePack } from './biblePack';
import type { DailyVerse, VerseTheme } from './verses';

type Ref = readonly [code: string, chapter: number, first: number, last: number, theme: VerseTheme, englishPsalmEnd: number];
const refs: readonly Ref[] = ${JSON.stringify(rows)};
const installed = new Map<GlobalLocaleTag, DailyVerse[]>();

export function getDownloadedVerses(locale: GlobalLocaleTag): DailyVerse[] | null {
  return installed.get(locale) ?? null;
}

/** Use text from the verified edition itself; never show English as a local verse. */
export function registerDownloadedVersePack(pack: BiblePack): void {
  const books = new Map(pack.books.map((book) => [book.code, book]));
  const result: DailyVerse[] = [];
  for (const [code, chapter, first, last, theme, englishPsalmEnd] of refs) {
    const book = books.get(code);
    const lines = book?.chapters[chapter - 1];
    if (!book || !lines) continue;
    const numbered = lines.map(([label, text]) => {
      const numbers = label.match(/\\d+/g)?.map(Number) ?? [];
      return { start: numbers[0] ?? -1, end: numbers.at(-1) ?? -1, text };
    });
    const end = Math.max(...numbered.map((line) => line.end));
    const shift = englishPsalmEnd ? Math.max(0, end - englishPsalmEnd) : 0;
    const from = first + shift;
    const to = last + shift;
    const text = numbered
      .filter((line) => line.start <= to && line.end >= from)
      .map((line) => line.text)
      .join(' ')
      .replace(/\\s+/g, ' ')
      .replace(/\\s+([,.;:!?])/g, '$1')
      .trim();
    if (!text) continue;
    result.push({ theme, text, reference: book.name + ' ' + chapter + ':' + from + (to === from ? '' : '-' + to) });
  }
  if (!result.length) throw new Error('Installed Bible pack has no curated daily verses');
  installed.set(pack.locale, result);
}
`;
writeFileSync(new URL('../src/data/downloadedVersePool.ts', import.meta.url), source);
console.log(`Generated ${rows.length} daily references`);
