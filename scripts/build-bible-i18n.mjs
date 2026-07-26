/**
 * Builds the multilingual full-Bible bundle for the offline reader.
 *
 * Turkish stays on the bundled Yorumsuz Türkçe Çeviri (see build-bible.mjs);
 * this script generates the other five locales from open, redistributable
 * sources (seven1m/open-bibles), matching the exact shape of bible-full.json:
 *   { credit, books: [ { code, name, chapters: [ [ [label, text], ... ] ] } ] }
 *
 * Sources (download into $SRC before running). Rights status is verified in
 * docs/scripture-sources.md and enforced by src/data/scriptureRights.ts — the
 * `credit` strings below are historical and are NOT what the app displays:
 *   eng-web.usfx.xml       World English Bible          public domain (verified)
 *   spa-rv1909.usfx.xml    Reina-Valera 1909            public domain (verified)
 *   por-almeida.usfx.xml   João Ferreira de Almeida     UNVERIFIED — edition unidentified
 *   fra-ostervald.osis.xml Ostervald 1996 (revision)    UNVERIFIED — 1996 reviser/publisher known
 *   deu-luther1912.osis.xml Luther 1912                 public domain (verified)
 *
 * Do not add a rights claim to a new locale here. Add it to scriptureRights.ts
 * with its evidence, or the release gate will reject it.
 *
 *   SRC=/path/to/xml node scripts/build-bible-i18n.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = process.env.SRC ?? '/tmp/claude-0/-home-user-Dailyprayer/f68409f0-42df-521e-a72d-6cd90aa3705c/scratchpad/src';

// Canonical 66-book order, keyed by USFX code — the same order bible-full.json uses.
const CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK',
  'JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT',
  'PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
];

// OSIS osisID -> canonical USFX code (for the OSIS-format sources).
const OSIS_TO_CODE = {
  Gen:'GEN',Exod:'EXO',Lev:'LEV',Num:'NUM',Deut:'DEU',Josh:'JOS',Judg:'JDG',Ruth:'RUT',
  '1Sam':'1SA','2Sam':'2SA','1Kgs':'1KI','2Kgs':'2KI','1Chr':'1CH','2Chr':'2CH',Ezra:'EZR',
  Neh:'NEH',Esth:'EST',Job:'JOB',Ps:'PSA',Prov:'PRO',Eccl:'ECC',Song:'SNG',Isa:'ISA',
  Jer:'JER',Lam:'LAM',Ezek:'EZK',Dan:'DAN',Hos:'HOS',Joel:'JOL',Amos:'AMO',Obad:'OBA',
  Jonah:'JON',Mic:'MIC',Nah:'NAM',Hab:'HAB',Zeph:'ZEP',Hag:'HAG',Zech:'ZEC',Mal:'MAL',
  Matt:'MAT',Mark:'MRK',Luke:'LUK',John:'JHN',Acts:'ACT',Rom:'ROM','1Cor':'1CO','2Cor':'2CO',
  Gal:'GAL',Eph:'EPH',Phil:'PHP',Col:'COL','1Thess':'1TH','2Thess':'2TH','1Tim':'1TI',
  '2Tim':'2TI',Titus:'TIT',Phlm:'PHM',Heb:'HEB',Jas:'JAS','1Pet':'1PE','2Pet':'2PE',
  '1John':'1JN','2John':'2JN','3John':'3JN',Jude:'JUD',Rev:'REV',
};

// Localized book names for the OSIS sources (they carry no per-book heading).
const NAMES_FR = ['Genèse','Exode','Lévitique','Nombres','Deutéronome','Josué','Juges','Ruth',
  '1 Samuel','2 Samuel','1 Rois','2 Rois','1 Chroniques','2 Chroniques','Esdras','Néhémie',
  'Esther','Job','Psaumes','Proverbes','Ecclésiaste','Cantique des Cantiques','Ésaïe','Jérémie',
  'Lamentations','Ézéchiel','Daniel','Osée','Joël','Amos','Abdias','Jonas','Michée','Nahum',
  'Habacuc','Sophonie','Aggée','Zacharie','Malachie','Matthieu','Marc','Luc','Jean','Actes',
  'Romains','1 Corinthiens','2 Corinthiens','Galates','Éphésiens','Philippiens','Colossiens',
  '1 Thessaloniciens','2 Thessaloniciens','1 Timothée','2 Timothée','Tite','Philémon','Hébreux',
  'Jacques','1 Pierre','2 Pierre','1 Jean','2 Jean','3 Jean','Jude','Apocalypse'];
const NAMES_DE = ['1. Mose','2. Mose','3. Mose','4. Mose','5. Mose','Josua','Richter','Rut',
  '1. Samuel','2. Samuel','1. Könige','2. Könige','1. Chronik','2. Chronik','Esra','Nehemia',
  'Ester','Hiob','Psalmen','Sprüche','Prediger','Hoheslied','Jesaja','Jeremia','Klagelieder',
  'Hesekiel','Daniel','Hosea','Joel','Amos','Obadja','Jona','Micha','Nahum','Habakuk','Zefanja',
  'Haggai','Sacharja','Maleachi','Matthäus','Markus','Lukas','Johannes','Apostelgeschichte',
  'Römer','1. Korinther','2. Korinther','Galater','Epheser','Philipper','Kolosser',
  '1. Thessalonicher','2. Thessalonicher','1. Timotheus','2. Timotheus','Titus','Philemon',
  'Hebräer','Jakobus','1. Petrus','2. Petrus','1. Johannes','2. Johannes','3. Johannes','Judas',
  'Offenbarung'];

const clean = (t) =>
  t.replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();

// ── USFX parser (en/es/pt) ────────────────────────────────────────────────
// <book id="GEN">…<h>Name</h>…<c id="1"/>…<v id="1"/>text<ve/>…
function parseUsfx(xml) {
  const out = {}; // code -> { name, chapters: { chNum: [[label,text]] } }
  // Split into <book>…</book> blocks.
  const bookRe = /<book id="([A-Z0-9]+)">([\s\S]*?)<\/book>/g;
  let bm;
  while ((bm = bookRe.exec(xml))) {
    const code = bm[1];
    if (!CODES.includes(code)) continue; // skip front matter, apocrypha, glossary
    const body = bm[2];
    const nameM = body.match(/<h>([^<]*)<\/h>/);
    const name = nameM ? clean(nameM[1]) : code;
    const chapters = {};
    // Walk chapter/verse markers in document order.
    const tokRe = /<c id="(\d+)"\s*\/>|<v id="(\d+)"\s*\/>([\s\S]*?)(?=<v id="\d+"\s*\/>|<ve\s*\/>|<c id="\d+"\s*\/>|$)/g;
    let cur = 0, tk;
    while ((tk = tokRe.exec(body))) {
      if (tk[1] !== undefined) { cur = Number(tk[1]); continue; }
      const label = tk[2];
      // Strip footnotes <f>…</f> and cross-refs <x>…</x> before cleaning tags.
      const raw = tk[3].replace(/<f[\s\S]*?<\/f>/g, '').replace(/<x[\s\S]*?<\/x>/g, '');
      const text = clean(raw);
      if (!text) continue;
      (chapters[cur] ??= []).push([label, text]);
    }
    out[code] = { name, chapters };
  }
  return out;
}

// ── OSIS parser (fr/de) ───────────────────────────────────────────────────
// <div type='book' osisID='Gen'>…<chapter osisID='Gen.1'>…<verse osisID='Gen.1.1'>text</verse>
function parseOsis(xml, nameByCode) {
  const out = {};
  const bookRe = /<div type=['"]book['"] osisID=['"]([A-Za-z0-9]+)['"][^>]*>([\s\S]*?)(?=<div type=['"]book['"]|<\/osisText>)/g;
  let bm;
  while ((bm = bookRe.exec(xml))) {
    const code = OSIS_TO_CODE[bm[1]];
    if (!code) continue;
    const body = bm[2];
    const chapters = {};
    const vRe = /<verse osisID=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/verse>/g;
    let vm;
    while ((vm = vRe.exec(body))) {
      const parts = vm[1].split('.'); // Gen.1.1
      const ch = Number(parts[1]);
      const label = parts.slice(2).join('.');
      const raw = vm[2].replace(/<note[\s\S]*?<\/note>/g, '');
      const text = clean(raw);
      if (!text) continue;
      (chapters[ch] ??= []).push([label, text]);
    }
    out[code] = { name: nameByCode[code], chapters };
  }
  return out;
}

function assemble(parsed, credit) {
  const books = [];
  for (const code of CODES) {
    const b = parsed[code];
    if (!b) { console.warn(`  ! missing book ${code}`); continue; }
    const maxCh = Math.max(...Object.keys(b.chapters).map(Number));
    const chapters = [];
    for (let c = 1; c <= maxCh; c++) chapters.push(b.chapters[c] ?? []);
    books.push({ code, name: b.name, chapters });
  }
  return { credit, books };
}

const nameMap = (arr) => Object.fromEntries(CODES.map((c, i) => [c, arr[i]]));

const JOBS = [
  { locale: 'en', file: 'eng-web.usfx.xml', fmt: 'usfx',
    credit: 'World English Bible · Public Domain' },
  { locale: 'es', file: 'spa-rv1909.usfx.xml', fmt: 'usfx',
    credit: 'Reina-Valera 1909 · Dominio público' },
  { locale: 'pt', file: 'por-almeida.usfx.xml', fmt: 'usfx',
    credit: 'João Ferreira de Almeida · Domínio público' },
  { locale: 'fr', file: 'fra-ostervald.osis.xml', fmt: 'osis', names: nameMap(NAMES_FR),
    credit: 'Bible Ostervald · Domaine public' },
  { locale: 'de', file: 'deu-luther1912.osis.xml', fmt: 'osis', names: nameMap(NAMES_DE),
    credit: 'Lutherbibel 1912 · Gemeinfrei' },
];

const OUT_DIR = new URL('../src/data/', import.meta.url).pathname;
const names = {}; // locale -> { code: name }

for (const job of JOBS) {
  const path = join(SRC, job.file);
  if (!existsSync(path)) { console.error(`missing source: ${path}`); process.exit(1); }
  const xml = readFileSync(path, 'utf8');
  const parsed = job.fmt === 'usfx' ? parseUsfx(xml) : parseOsis(xml, job.names);
  const data = assemble(parsed, job.credit);
  writeFileSync(join(OUT_DIR, `bible-full.${job.locale}.json`), JSON.stringify(data));
  names[job.locale] = Object.fromEntries(data.books.map((b) => [b.code, b.name]));
  const chs = data.books.reduce((n, b) => n + b.chapters.length, 0);
  const vs = data.books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.length, 0), 0);
  console.log(`${job.locale}: ${data.books.length} books, ${chs} chapters, ${vs} verses -> bible-full.${job.locale}.json`);
}

// Fold in the Turkish names from the existing YTC meta, then write the shared
// name map: { code: { tr, en, es, pt, fr, de } } — cheap localized headings.
const trMeta = JSON.parse(readFileSync(join(OUT_DIR, 'bible-books.json'), 'utf8'));
const trNames = Object.fromEntries(trMeta.map((b) => [b.code, b.name]));
const merged = {};
for (const code of CODES) {
  merged[code] = {
    tr: trNames[code], en: names.en[code], es: names.es[code],
    pt: names.pt[code], fr: names.fr[code], de: names.de[code],
  };
}
writeFileSync(join(OUT_DIR, 'bible-book-names.json'), JSON.stringify(merged, null, 0));
console.log('names -> bible-book-names.json');
