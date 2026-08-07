#!/usr/bin/env node
/**
 * Build one or all source-pinned eBible USFX downloads into Lumen Bible packs.
 *
 * Scripture text is parsed from the named source edition. It is never translated
 * or rewritten. XML entities/markup and layout whitespace are decoded/removed as
 * transport formatting only.
 *
 * Usage:
 *   node scripts/build-ebible-pack.mjs en
 *   node scripts/build-ebible-pack.mjs all
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EBIBLE_PACK_SOURCES, ebibleDetailsUrl, ebibleUsfxUrl } from './ebible-pack-sources.mjs';

const SCHEMA_VERSION = 1;
const CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK',
  'JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT',
  'PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function decodeXml(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanTransportMarkup(text) {
  return decodeXml(text.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function parseUsfx(xml) {
  const result = {};
  const bookRe = /<book\s+id=["']([A-Z0-9]+)["'][^>]*>([\s\S]*?)(?=<book\s+id=["'][A-Z0-9]+["']|<\/book>|$)/g;
  let bookMatch;

  while ((bookMatch = bookRe.exec(xml))) {
    const code = bookMatch[1];
    if (!CODES.includes(code)) continue;
    const body = bookMatch[2];
    const heading = body.match(/<h[^>]*>([\s\S]*?)<\/h>/);
    const name = heading ? cleanTransportMarkup(heading[1]) : code;
    const chapters = {};
    let currentChapter = 0;

    const tokenRe = /<c\s+id=["'](\d+)["'][^>]*\/>|<v\s+id=["']([^"']+)["'][^>]*\/>\s*([\s\S]*?)(?=<v\s+id=["'][^"']+["'][^>]*\/>|<ve\s*\/>|<c\s+id=["']\d+["'][^>]*\/>|$)/g;
    let token;
    while ((token = tokenRe.exec(body))) {
      if (token[1] !== undefined) {
        currentChapter = Number(token[1]);
        continue;
      }
      if (!currentChapter) continue;
      const label = token[2];
      const raw = token[3]
        .replace(/<f\b[\s\S]*?<\/f>/g, '')
        .replace(/<x\b[\s\S]*?<\/x>/g, '');
      const text = cleanTransportMarkup(raw);
      if (text) (chapters[currentChapter] ??= []).push([label, text]);
    }
    result[code] = { name, chapters };
  }

  return result;
}

function canonicalMeta() {
  const metaPath = new URL('../src/data/bible-books.json', import.meta.url);
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (!Array.isArray(meta) || meta.length !== CODES.length) throw new Error('Invalid canonical Bible metadata');
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
      if (!Array.isArray(chapter) || chapter.length === 0) {
        throw new Error(`Source is missing ${code} chapter ${index + 1}`);
      }
      return chapter;
    });
    return { code, name: sourceBook.name, chapters };
  });
}

function extractXml(zipPath, dir) {
  let listing;
  try {
    listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
  } catch {
    throw new Error('The "unzip" command is required to build eBible packs');
  }
  const candidates = listing
    .split(/\r?\n/)
    .filter((name) => /\.(?:xml|usfx)$/i.test(name) && !name.includes('__MACOSX'));
  if (!candidates.length) throw new Error('USFX archive contains no XML/USFX file');

  const parts = candidates.map((name) =>
    execFileSync('unzip', ['-p', zipPath, name], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
  );
  return parts.join('\n');
}

function generatedAt() {
  const epoch = process.env.SOURCE_DATE_EPOCH;
  return epoch ? new Date(Number(epoch) * 1000).toISOString() : new Date().toISOString();
}

async function build(locale) {
  const source = EBIBLE_PACK_SOURCES[locale];
  if (!source) throw new Error(`No verified eBible source pin for locale: ${locale}`);

  const url = ebibleUsfxUrl(source.id);
  console.log(`[${locale}] downloading ${url}`);
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`[${locale}] source download failed: HTTP ${response.status}`);
  const zipBytes = Buffer.from(await response.arrayBuffer());
  const sourceSha256 = sha256(zipBytes);

  const tempRoot = process.env.BIBLE_PACK_TMPDIR ?? tmpdir();
  if (!existsSync(tempRoot)) mkdirSync(tempRoot, { recursive: true });
  const work = mkdtempSync(join(tempRoot, 'lumen-bible-pack-'));
  try {
    const zipPath = join(work, `${source.id}.zip`);
    writeFileSync(zipPath, zipBytes);
    const xml = extractXml(zipPath, work);
    const books = assemble(parseUsfx(xml));
    const verseCount = books.reduce(
      (total, book) => total + book.chapters.reduce((n, chapter) => n + chapter.length, 0),
      0,
    );

    const pack = {
      schemaVersion: SCHEMA_VERSION,
      locale,
      edition: source.edition,
      credit: `${source.edition} · Public Domain · eBible.org`,
      sourceUrl: url,
      sourceDetailsUrl: ebibleDetailsUrl(source.id),
      sourceSha256,
      generatedAt: generatedAt(),
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
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const requested = process.argv[2];
if (!requested) {
  console.error('Usage: node scripts/build-ebible-pack.mjs <locale|all>');
  process.exit(2);
}

const locales = requested === 'all' ? Object.keys(EBIBLE_PACK_SOURCES) : [requested];
for (const locale of locales) await build(locale);
