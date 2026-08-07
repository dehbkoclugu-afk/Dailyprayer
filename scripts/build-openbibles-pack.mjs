#!/usr/bin/env node
/**
 * Build full-Bible candidate packs from seven1m/open-bibles.
 *
 * Candidate rights labels are NOT production approval. The exact raw source is
 * checksum-pinned in the generated pack and the production release gate remains
 * closed until independent rights/jurisdiction review is recorded.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  OPEN_BIBLES_PACK_SOURCES,
  openBiblesBlobUrl,
  openBiblesRawUrl,
} from './openbibles-pack-sources.mjs';

const SCHEMA_VERSION = 1;
const CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK',
  'JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT',
  'PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
];

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

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function decodeXml(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function clean(text) {
  return decodeXml(text.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function parseOsis(xml) {
  const result = {};
  const bookRe = /<div\s+([^>]*\btype=['"]book['"][^>]*)>([\s\S]*?)(?=<div\s+[^>]*\btype=['"]book['"]|<\/osisText>)/g;
  let book;
  while ((book = bookRe.exec(xml))) {
    const sourceId = book[1].match(/\bosisID=['"]([^'"]+)['"]/)?.[1];
    const code = sourceId ? OSIS_TO_CODE[sourceId] : undefined;
    if (!code) continue;
    const chapters = {};
    const verseRe = /<verse\s+osisID=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/verse>/g;
    let verse;
    while ((verse = verseRe.exec(book[2]))) {
      const parts = verse[1].split('.');
      const chapter = Number(parts[1]);
      const label = parts.slice(2).join('.');
      const text = clean(verse[2].replace(/<note\b[\s\S]*?<\/note>/g, ''));
      if (chapter && label && text) (chapters[chapter] ??= []).push([label, text]);
    }
    result[code] = { name: code, chapters };
  }
  return result;
}

function parseZefania(xml) {
  const result = {};
  const bookRe = /<BIBLEBOOK\s+[^>]*bnumber=["'](\d+)["'][^>]*bname=["']([^"']*)["'][^>]*>([\s\S]*?)<\/BIBLEBOOK>/g;
  let book;
  while ((book = bookRe.exec(xml))) {
    const index = Number(book[1]) - 1;
    const code = CODES[index];
    if (!code) continue;
    const chapters = {};
    const chapterRe = /<CHAPTER\s+[^>]*cnumber=["'](\d+)["'][^>]*>([\s\S]*?)<\/CHAPTER>/g;
    let chapter;
    while ((chapter = chapterRe.exec(book[3]))) {
      const chapterNumber = Number(chapter[1]);
      const verses = [];
      const verseRe = /<VERS\s+[^>]*vnumber=["']([^"']+)["'][^>]*>([\s\S]*?)<\/VERS>/g;
      let verse;
      while ((verse = verseRe.exec(chapter[2]))) {
        const text = clean(verse[2]);
        if (text) verses.push([verse[1], text]);
      }
      if (verses.length) chapters[chapterNumber] = verses;
    }
    result[code] = { name: clean(book[2]) || code, chapters };
  }
  return result;
}

function canonicalMeta() {
  const metaPath = new URL('../src/data/bible-books.json', import.meta.url);
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  return new Map(meta.map((book) => [book.code, book.chapters]));
}

function assemble(parsed) {
  const expected = canonicalMeta();
  return CODES.map((code) => {
    const sourceBook = parsed[code];
    if (!sourceBook) throw new Error(`Source is missing canonical book ${code}`);
    const expectedChapters = expected.get(code);
    const chapters = Array.from({ length: expectedChapters }, (_, index) => {
      const chapter = sourceBook.chapters[index + 1];
      if (!Array.isArray(chapter) || !chapter.length) {
        throw new Error(`Source is missing ${code} chapter ${index + 1}`);
      }
      return chapter;
    });
    return { code, name: sourceBook.name, chapters };
  });
}

async function downloadSource(url, locale) {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, { redirect: 'follow' });
    lastStatus = response.status;
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if ((response.status !== 429 && response.status < 500) || attempt === 3) break;
    console.warn(`[${locale}] HTTP ${response.status}; retrying (${attempt}/3)`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  throw new Error(`[${locale}] source download failed after retries: HTTP ${lastStatus}`);
}

async function build(locale) {
  const source = OPEN_BIBLES_PACK_SOURCES[locale];
  if (!source) throw new Error(`No Open Bibles source pin for locale: ${locale}`);
  const sourceUrl = openBiblesRawUrl(source.file);
  console.log(`[${locale}] downloading ${sourceUrl}`);
  const bytes = await downloadSource(sourceUrl, locale);
  const xml = bytes.toString('utf8');
  const parsed = source.format === 'osis' ? parseOsis(xml) : parseZefania(xml);
  const books = assemble(parsed);
  const verseCount = books.reduce(
    (total, book) => total + book.chapters.reduce((n, chapter) => n + chapter.length, 0), 0,
  );

  const pack = {
    schemaVersion: SCHEMA_VERSION,
    locale,
    edition: source.edition,
    credit: `${source.edition} · Public Domain candidate · seven1m/open-bibles`,
    sourceUrl,
    sourceDetailsUrl: openBiblesBlobUrl(source.file),
    sourceSha256: sha256(bytes),
    generatedAt: new Date().toISOString(),
    rightsStatus: source.rights,
    books,
  };

  const output = Buffer.from(JSON.stringify(pack));
  const outputHash = sha256(output);
  const outDir = new URL('../dist/bible-packs/', import.meta.url);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir.pathname, `${locale}.json`);
  writeFileSync(outPath, output);
  writeFileSync(`${outPath}.sha256`, `${outputHash}  ${locale}.json\n`);
  console.log(`[${locale}] ${books.length} books · ${verseCount} verses · ${output.length} bytes · sha256 ${outputHash}`);
}

const requested = process.argv[2];
if (!requested) {
  console.error('Usage: node scripts/build-openbibles-pack.mjs <locale|all>');
  process.exit(2);
}

if (requested !== 'all') {
  await build(requested);
} else {
  const failures = [];
  for (const locale of Object.keys(OPEN_BIBLES_PACK_SOURCES)) {
    try {
      await build(locale);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ locale, message });
      console.error(`[${locale}] BLOCKED: ${message}`);
    }
  }
  if (failures.length) {
    console.error('\nOpen Bibles pack blockers:');
    for (const failure of failures) console.error(`- ${failure.locale}: ${failure.message}`);
    process.exitCode = 1;
  }
}
