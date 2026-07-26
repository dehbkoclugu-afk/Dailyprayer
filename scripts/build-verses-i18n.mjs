/**
 * Builds src/data/verses-i18n.json — the daily-verse pool resolved in all six
 * bundled languages, from the curated reference list (scripts/curated-refs.mjs)
 * against the full-Bible JSON (src/data/bible-full.<locale>.json).
 *
 * Shape (theme-interleaved, day-of-year order):
 *   [ { theme, text: {tr,en,es,pt,fr,de}, reference: {tr,en,es,pt,fr,de} } ]
 *
 *   node scripts/build-verses-i18n.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { CURATED } from './curated-refs.mjs';

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'];
const DIR = new URL('../src/data/', import.meta.url).pathname;

// English book name (as written in the curated list) -> canonical USFX code.
const CODE = {
  genesis:'GEN',exodus:'EXO',leviticus:'LEV',numbers:'NUM',deuteronomy:'DEU',joshua:'JOS',
  judges:'JDG',ruth:'RUT','1 samuel':'1SA','2 samuel':'2SA','1 kings':'1KI','2 kings':'2KI',
  '1 chronicles':'1CH','2 chronicles':'2CH',ezra:'EZR',nehemiah:'NEH',esther:'EST',job:'JOB',
  psalm:'PSA',psalms:'PSA',proverbs:'PRO',ecclesiastes:'ECC','song of solomon':'SNG',isaiah:'ISA',
  jeremiah:'JER',lamentations:'LAM',ezekiel:'EZK',daniel:'DAN',hosea:'HOS',joel:'JOL',amos:'AMO',
  obadiah:'OBA',jonah:'JON',micah:'MIC',nahum:'NAM',habakkuk:'HAB',zephaniah:'ZEP',haggai:'HAG',
  zechariah:'ZEC',malachi:'MAL',matthew:'MAT',mark:'MRK',luke:'LUK',john:'JHN',acts:'ACT',
  romans:'ROM','1 corinthians':'1CO','2 corinthians':'2CO',galatians:'GAL',ephesians:'EPH',
  philippians:'PHP',colossians:'COL','1 thessalonians':'1TH','2 thessalonians':'2TH',
  '1 timothy':'1TI','2 timothy':'2TI',titus:'TIT',philemon:'PHM',hebrews:'HEB',james:'JAS',
  '1 peter':'1PE','2 peter':'2PE','1 john':'1JN','2 john':'2JN','3 john':'3JN',jude:'JUD',
  revelation:'REV',
};

// Reference book names default to the full-Bible heading; Psalms uses the
// conventional singular ("Psalm 23", not "Psalms 23") in each language.
const bookNames = JSON.parse(readFileSync(DIR + 'bible-book-names.json', 'utf8'));
const PSALM_SINGULAR = { tr: 'Mezmur', en: 'Psalm', es: 'Salmo', pt: 'Salmo', fr: 'Psaume', de: 'Psalm' };
const refName = (locale, code) =>
  code === 'PSA' ? PSALM_SINGULAR[locale] : (bookNames[code]?.[locale] ?? bookNames[code]?.en ?? code);

// Load every locale's Bible into byBook[locale][code][chapter] = [[a,b,text]].
const bibles = {};
for (const l of LOCALES) {
  const books = JSON.parse(readFileSync(DIR + `bible-full.${l}.json`, 'utf8')).books;
  const idx = {};
  for (const b of books) {
    const chapters = {};
    b.chapters.forEach((verses, ci) => {
      chapters[ci + 1] = verses.map(([label, text]) => {
        const [a, bb] = String(label).includes('-')
          ? String(label).split('-').map(Number)
          : [Number(label), Number(label)];
        return [a, bb, text];
      });
    });
    idx[b.code] = chapters;
  }
  bibles[l] = idx;
}

function parseRef(ref) {
  const m = ref.match(/^(\d?\s?[A-Za-z ]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`bad ref ${ref}`);
  const [, book, ch, a, b] = m;
  return { book: book.trim().toLowerCase(), chapter: +ch, v1: +a, v2: b ? +b : +a };
}

function verseText(locale, code, chapter, v1, v2) {
  const entries = bibles[locale][code]?.[chapter];
  if (!entries) return null;
  const hits = entries.filter((e) => e[0] <= v2 && e[1] >= v1).sort((x, y) => x[0] - y[0]);
  const seen = new Set();
  const parts = [];
  for (const [a, , text] of hits) {
    if (seen.has(a)) continue;
    seen.add(a);
    if (text) parts.push(text);
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  return text || null;
}

// Resolve every curated reference, deduped, preserving group order.
const entries = [];
const seen = new Set();
const misses = {};
for (const [group, refs] of Object.entries(CURATED)) {
  const theme = group.replace(/\d+$/, '');
  for (const ref of refs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    const { book, chapter, v1, v2 } = parseRef(ref);
    const code = CODE[book];
    if (!code) throw new Error(`no book map for "${book}" (${ref})`);
    const span = v2 !== v1 ? `-${v2}` : '';
    const text = {};
    const reference = {};
    // English is the fallback for any locale whose versification drops a verse.
    const enText = verseText('en', code, chapter, v1, v2);
    for (const l of LOCALES) {
      const t = verseText(l, code, chapter, v1, v2);
      if (!t) (misses[l] ??= []).push(ref);
      text[l] = t ?? enText ?? '';
      reference[l] = `${refName(l, code)} ${chapter}:${v1}${span}`;
    }
    entries.push({ theme, text, reference });
  }
}

// Theme-interleave so consecutive days vary (same algorithm as the old generator).
const byTheme = {};
for (const e of entries) (byTheme[e.theme] ??= []).push(e);
const pools = Object.values(byTheme);
const interleaved = [];
let added = true;
while (added) {
  added = false;
  for (const pool of pools) {
    const item = pool.shift();
    if (item) { interleaved.push(item); added = true; }
  }
}

// Emit verses.ts with the pool inlined — no JSON import, so it loads under both
// Metro and the plain Node ESM test runner (which requires import attributes).
const header = `/**
 * Daily verses, localized into every bundled language.
 *
 * The pool resolves the curated reference list (scripts/curated-refs.mjs)
 * against each translation's full text, in a fixed theme-interleaved order for
 * day-of-year rotation. Each locale uses the edition bundled with the reader,
 * under its own rights: see src/data/scriptureRights.ts for the per-edition
 * copyright, license and attribution conditions. Two editions are licensed
 * rather than public domain (Turkish CC BY-ND 4.0, Portuguese CC BY 4.0), so the
 * verses shown here must stay verbatim and keep their credit.
 *
 * GENERATED — rebuild with scripts/build-verses-i18n.mjs; edit the reference
 * list in scripts/curated-refs.mjs, not this file.
 */
import type { Locale } from '@/i18n/translations';

export type VerseTheme =
  | 'peace' | 'strength' | 'trust' | 'rest' | 'hope' | 'anxiety' | 'guidance'
  | 'joy' | 'love' | 'gratitude' | 'comfort' | 'faith' | 'forgiveness';

export interface DailyVerse {
  text: string;
  reference: string;
  theme: VerseTheme;
}

interface PoolEntry {
  theme: VerseTheme;
  text: Record<Locale, string>;
  reference: Record<Locale, string>;
}

const versePool: PoolEntry[] = ${JSON.stringify(interleaved)};

/** Size of the rotation pool (locale-independent). */
export const verseCount = versePool.length;

const cache: Partial<Record<Locale, DailyVerse[]>> = {};

/** The daily-verse pool with text + reference in the given locale (cached). */
export function getVerses(locale: Locale): DailyVerse[] {
  return (cache[locale] ??= versePool.map((e) => ({
    text: e.text[locale] ?? e.text.en,
    reference: e.reference[locale] ?? e.reference.en,
    theme: e.theme,
  })));
}
`;
writeFileSync(DIR + 'verses.ts', header);
console.log(`Wrote ${interleaved.length} verses -> verses.ts`);
for (const l of LOCALES) {
  const m = misses[l] ?? [];
  console.log(`  ${l}: ${m.length ? m.length + ' fell back to EN -> ' + m.join(', ') : 'all resolved'}`);
}
