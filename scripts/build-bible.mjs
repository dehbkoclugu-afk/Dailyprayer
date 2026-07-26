/**
 * Builds src/data/bible-full.tr.json — the whole Yorumsuz Türkçe Çeviri (YTC)
 * bundled for the offline sequential reader.
 *   YTC_XML=/path/to/turytc_vpl.xml node scripts/build-bible.mjs
 * License: YTC CC-BY-ND 4.0, © İsmail Serinken & eBible.org (verbatim).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const XML = process.env.YTC_XML ?? '/tmp/ytc/turytc_vpl.xml';
if (!existsSync(XML)) {
  console.error(`YTC XML not found at ${XML}`);
  process.exit(1);
}

// Canonical order: [OSIS code, Turkish name].
const ORDER = [
  ['GEN', 'Yaratılış'], ['EXO', 'Mısır’dan Çıkış'], ['LEV', 'Levililer'], ['NUM', 'Çölde Sayım'],
  ['DEU', 'Yasa’nın Tekrarı'], ['JOS', 'Yeşu'], ['JDG', 'Hâkimler'], ['RUT', 'Rut'],
  ['1SA', '1. Samuel'], ['2SA', '2. Samuel'], ['1KI', '1. Krallar'], ['2KI', '2. Krallar'],
  ['1CH', '1. Tarihler'], ['2CH', '2. Tarihler'], ['EZR', 'Ezra'], ['NEH', 'Nehemya'],
  ['EST', 'Ester'], ['JOB', 'Eyüp'], ['PSA', 'Mezmurlar'], ['PRO', 'Süleyman’ın Özdeyişleri'],
  ['ECC', 'Vaiz'], ['SNG', 'Ezgiler Ezgisi'], ['ISA', 'Yeşaya'], ['JER', 'Yeremya'],
  ['LAM', 'Ağıtlar'], ['EZK', 'Hezekiel'], ['DAN', 'Daniel'], ['HOS', 'Hoşea'],
  ['JOL', 'Yoel'], ['AMO', 'Amos'], ['OBA', 'Ovadya'], ['JON', 'Yunus'], ['MIC', 'Mika'],
  ['NAM', 'Nahum'], ['HAB', 'Habakkuk'], ['ZEP', 'Sefanya'], ['HAG', 'Hagay'], ['ZEC', 'Zekeriya'],
  ['MAL', 'Malaki'], ['MAT', 'Matta'], ['MRK', 'Markos'], ['LUK', 'Luka'], ['JHN', 'Yuhanna'],
  ['ACT', 'Elçilerin İşleri'], ['ROM', 'Romalılar'], ['1CO', '1. Korintliler'], ['2CO', '2. Korintliler'],
  ['GAL', 'Galatyalılar'], ['EPH', 'Efesliler'], ['PHP', 'Filipililer'], ['COL', 'Koloseliler'],
  ['1TH', '1. Selanikliler'], ['2TH', '2. Selanikliler'], ['1TI', '1. Timoteos'], ['2TI', '2. Timoteos'],
  ['TIT', 'Titus'], ['PHM', 'Filimon'], ['HEB', 'İbraniler'], ['JAS', 'Yakup'], ['1PE', '1. Petrus'],
  ['2PE', '2. Petrus'], ['1JN', '1. Yuhanna'], ['2JN', '2. Yuhanna'], ['3JN', '3. Yuhanna'],
  ['JUD', 'Yahuda'], ['REV', 'Vahiy'],
];

const raw = readFileSync(XML, 'utf8');
// byBook[code][chapter] = [{ n: label, t: text }] in document order.
const byBook = {};
const re = /<v b="([A-Z0-9]+)" c="(\d+)" v="([0-9-]+)">([\s\S]*?)<\/v>/g;
let m;
while ((m = re.exec(raw))) {
  const [, code, ch, label, text] = m;
  const t = text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  if (!t) continue;
  ((byBook[code] ??= {})[Number(ch)] ??= []).push({ n: label, t });
}

const books = [];
for (const [code, name] of ORDER) {
  const chObj = byBook[code];
  if (!chObj) continue;
  const maxCh = Math.max(...Object.keys(chObj).map(Number));
  const chapters = [];
  for (let c = 1; c <= maxCh; c++) {
    const verses = chObj[c] ?? [];
    // Store as [label, text] pairs (labels keep ranges like "17-18").
    chapters.push(verses.map((v) => [v.n, v.t]));
  }
  books.push({ code, name, chapters });
}

const credit = 'Yorumsuz Türkçe Çeviri © İsmail Serinken & eBible.org · CC BY-ND 4.0';
const OUT = new URL('../src/data/bible-full.tr.json', import.meta.url).pathname;
writeFileSync(OUT, JSON.stringify({ credit, books }));

// Lightweight metadata (names + chapter counts) so the tab and the chapter
// picker can navigate without loading the ~4 MB full text.
const META = new URL('../src/data/bible-books.json', import.meta.url).pathname;
writeFileSync(
  META,
  JSON.stringify(books.map((b) => ({ code: b.code, name: b.name, chapters: b.chapters.length }))),
);

const bytes = readFileSync(OUT).length;
console.log(`Wrote ${books.length} books to src/data/bible-full.tr.json (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
console.log('meta -> src/data/bible-books.json');
console.log('total chapters:', books.reduce((n, b) => n + b.chapters.length, 0));
