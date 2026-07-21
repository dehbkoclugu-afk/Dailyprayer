/**
 * Generates src/data/verses.ts with Yorumsuz Türkçe Çeviri (YTC) text for the
 * curated reference list (shared with the WEB generator in curated-refs.mjs).
 *
 * Source: YTC verse-per-line XML from eBible.org (turytc_vpl.xml).
 *   YTC_XML=/path/to/turytc_vpl.xml node scripts/fetch-verses-ytc.mjs
 *
 * License: YTC is CC-BY-ND 4.0 — verbatim verses may be redistributed with
 * attribution and without modification. Credit © İsmail Serinken & eBible.org.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { CURATED } from './curated-refs.mjs';

const XML = process.env.YTC_XML ?? '/tmp/ytc/turytc_vpl.xml';
if (!existsSync(XML)) {
  console.error(`YTC XML not found at ${XML}. Set YTC_XML=/path/to/turytc_vpl.xml`);
  process.exit(1);
}

// English book name (as used in the curated list) -> { osis code, Turkish name }.
const BOOKS = {
  genesis: { osis: 'GEN', tr: 'Yaratılış' },
  exodus: { osis: 'EXO', tr: 'Mısır’dan Çıkış' },
  leviticus: { osis: 'LEV', tr: 'Levililer' },
  numbers: { osis: 'NUM', tr: 'Çölde Sayım' },
  deuteronomy: { osis: 'DEU', tr: 'Yasa’nın Tekrarı' },
  joshua: { osis: 'JOS', tr: 'Yeşu' },
  judges: { osis: 'JDG', tr: 'Hâkimler' },
  ruth: { osis: 'RUT', tr: 'Rut' },
  '1 samuel': { osis: '1SA', tr: '1. Samuel' },
  '2 samuel': { osis: '2SA', tr: '2. Samuel' },
  '1 kings': { osis: '1KI', tr: '1. Krallar' },
  '2 kings': { osis: '2KI', tr: '2. Krallar' },
  '1 chronicles': { osis: '1CH', tr: '1. Tarihler' },
  '2 chronicles': { osis: '2CH', tr: '2. Tarihler' },
  ezra: { osis: 'EZR', tr: 'Ezra' },
  nehemiah: { osis: 'NEH', tr: 'Nehemya' },
  esther: { osis: 'EST', tr: 'Ester' },
  job: { osis: 'JOB', tr: 'Eyüp' },
  psalm: { osis: 'PSA', tr: 'Mezmur' },
  psalms: { osis: 'PSA', tr: 'Mezmur' },
  proverbs: { osis: 'PRO', tr: 'Süleyman’ın Özdeyişleri' },
  ecclesiastes: { osis: 'ECC', tr: 'Vaiz' },
  'song of solomon': { osis: 'SNG', tr: 'Ezgiler Ezgisi' },
  isaiah: { osis: 'ISA', tr: 'Yeşaya' },
  jeremiah: { osis: 'JER', tr: 'Yeremya' },
  lamentations: { osis: 'LAM', tr: 'Ağıtlar' },
  ezekiel: { osis: 'EZK', tr: 'Hezekiel' },
  daniel: { osis: 'DAN', tr: 'Daniel' },
  hosea: { osis: 'HOS', tr: 'Hoşea' },
  joel: { osis: 'JOL', tr: 'Yoel' },
  amos: { osis: 'AMO', tr: 'Amos' },
  obadiah: { osis: 'OBA', tr: 'Ovadya' },
  jonah: { osis: 'JON', tr: 'Yunus' },
  micah: { osis: 'MIC', tr: 'Mika' },
  nahum: { osis: 'NAM', tr: 'Nahum' },
  habakkuk: { osis: 'HAB', tr: 'Habakkuk' },
  zephaniah: { osis: 'ZEP', tr: 'Sefanya' },
  haggai: { osis: 'HAG', tr: 'Hagay' },
  zechariah: { osis: 'ZEC', tr: 'Zekeriya' },
  malachi: { osis: 'MAL', tr: 'Malaki' },
  matthew: { osis: 'MAT', tr: 'Matta' },
  mark: { osis: 'MRK', tr: 'Markos' },
  luke: { osis: 'LUK', tr: 'Luka' },
  john: { osis: 'JHN', tr: 'Yuhanna' },
  acts: { osis: 'ACT', tr: 'Elçilerin İşleri' },
  romans: { osis: 'ROM', tr: 'Romalılar' },
  '1 corinthians': { osis: '1CO', tr: '1. Korintliler' },
  '2 corinthians': { osis: '2CO', tr: '2. Korintliler' },
  galatians: { osis: 'GAL', tr: 'Galatyalılar' },
  ephesians: { osis: 'EPH', tr: 'Efesliler' },
  philippians: { osis: 'PHP', tr: 'Filipililer' },
  colossians: { osis: 'COL', tr: 'Koloseliler' },
  '1 thessalonians': { osis: '1TH', tr: '1. Selanikliler' },
  '2 thessalonians': { osis: '2TH', tr: '2. Selanikliler' },
  '1 timothy': { osis: '1TI', tr: '1. Timoteos' },
  '2 timothy': { osis: '2TI', tr: '2. Timoteos' },
  titus: { osis: 'TIT', tr: 'Titus' },
  philemon: { osis: 'PHM', tr: 'Filimon' },
  hebrews: { osis: 'HEB', tr: 'İbraniler' },
  james: { osis: 'JAS', tr: 'Yakup' },
  '1 peter': { osis: '1PE', tr: '1. Petrus' },
  '2 peter': { osis: '2PE', tr: '2. Petrus' },
  '1 john': { osis: '1JN', tr: '1. Yuhanna' },
  '2 john': { osis: '2JN', tr: '2. Yuhanna' },
  '3 john': { osis: '3JN', tr: '3. Yuhanna' },
  jude: { osis: 'JUD', tr: 'Yahuda' },
  revelation: { osis: 'REV', tr: 'Vahiy' },
};

// Parse the VPL XML into byBook[osis][chapter] = [{ a, b, text }] (a..b verse span).
const raw = readFileSync(XML, 'utf8');
const byBook = {};
const re = /<v b="([A-Z0-9]+)" c="(\d+)" v="([0-9-]+)">([\s\S]*?)<\/v>/g;
let m;
while ((m = re.exec(raw))) {
  const [, book, ch, vspec, text] = m;
  const [a, b] = vspec.includes('-') ? vspec.split('-').map(Number) : [Number(vspec), Number(vspec)];
  const clean = text
    .replace(/<[^>]+>/g, '') // strip any inline markup
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  ((byBook[book] ??= {})[Number(ch)] ??= []).push({ a, b, text: clean });
}

function parseRef(ref) {
  const m = ref.match(/^(\d?\s?[A-Za-z ]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`bad ref ${ref}`);
  const [, book, ch, a, b] = m;
  return { book: book.trim(), chapter: +ch, v1: +a, v2: b ? +b : +a };
}

function verseText(osis, chapter, v1, v2) {
  const entries = byBook[osis]?.[chapter];
  if (!entries) throw new Error(`no ${osis} ${chapter}`);
  // collect every stored span that overlaps [v1, v2], in verse order
  const hits = entries
    .filter((e) => e.a <= v2 && e.b >= v1)
    .sort((x, y) => x.a - y.a);
  const seen = new Set();
  const parts = [];
  for (const h of hits) {
    if (seen.has(h.a)) continue;
    seen.add(h.a);
    if (h.text) parts.push(h.text);
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  if (!text) throw new Error(`empty ${osis} ${chapter}:${v1}-${v2}`);
  return text;
}

const entries = [];
const failed = [];
const seen = new Set();
for (const [group, refs] of Object.entries(CURATED)) {
  const theme = group.replace(/\d+$/, '');
  for (const ref of refs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    try {
      const { book, chapter, v1, v2 } = parseRef(ref);
      const meta = BOOKS[book.toLowerCase()];
      if (!meta) throw new Error(`no book map for "${book}"`);
      const text = verseText(meta.osis, chapter, v1, v2);
      const trRef = `${meta.tr} ${chapter}:${v1}${v2 !== v1 ? `-${v2}` : ''}`;
      entries.push({ text, reference: trRef, theme });
    } catch (e) {
      failed.push(`${ref}: ${e.message}`);
    }
  }
}

// Interleave themes so consecutive days vary (same as the WEB generator).
const byTheme = {};
for (const e of entries) (byTheme[e.theme] ??= []).push(e);
const pools = Object.values(byTheme);
const interleaved = [];
let added = true;
while (added) {
  added = false;
  for (const pool of pools) {
    const item = pool.shift();
    if (item) {
      interleaved.push(item);
      added = true;
    }
  }
}

const themeUnion = [...new Set(Object.keys(CURATED).map((g) => g.replace(/\d+$/, '')))]
  .map((t) => `'${t}'`)
  .join(' | ');
const body = interleaved
  .map((e) => `  { text: ${JSON.stringify(e.text)}, reference: ${JSON.stringify(e.reference)}, theme: '${e.theme}' },`)
  .join('\n');

const OUT = new URL('../src/data/verses.ts', import.meta.url).pathname;
writeFileSync(
  OUT,
  `/**
 * Daily verses — Yorumsuz Türkçe Çeviri (YTC), © İsmail Serinken & eBible.org,
 * CC-BY-ND 4.0 (verbatim, with attribution). GENERATED by
 * scripts/fetch-verses-ytc.mjs from the YTC verse-per-line source — edit the
 * curated reference list in scripts/curated-refs.mjs, not this file.
 * ${interleaved.length} entries, theme-interleaved for day-of-year rotation.
 */
export interface DailyVerse {
  text: string;
  reference: string;
  theme: ${themeUnion};
}

export const verses: DailyVerse[] = [
${body}
];
`,
);

console.log(`Wrote ${interleaved.length} verses to src/data/verses.ts`);
if (failed.length) {
  console.log(`Failed (${failed.length}):`);
  failed.forEach((f) => console.log(' -', f));
}
