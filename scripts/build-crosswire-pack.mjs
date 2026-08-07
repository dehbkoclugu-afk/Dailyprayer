#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CROSSWIRE_PD_FALLBACKS,
  crossWireInfoUrl,
  crossWireRawZipUrl,
} from './crosswire-pack-sources.mjs';

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
function clean(text) {
  return text.replace(/<note\b[\s\S]*?<\/note>/g, '').replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

function parseOsis(xml) {
  const result = {};
  const bookRe = /<div\s+([^>]*\btype=["']book["'][^>]*)>([\s\S]*?)(?=<div\s+[^>]*\btype=["']book["']|<\/osisText>)/g;
  let book;
  while ((book = bookRe.exec(xml))) {
    const sourceId = book[1].match(/\bosisID=["']([^"']+)["']/)?.[1];
    const code = sourceId ? OSIS_TO_CODE[sourceId] : undefined;
    if (!code) continue;
    const chapters = {};
    const add = (osisId, raw) => {
      const parts = osisId.split('.');
      const chapter = Number(parts[1]);
      const label = parts.slice(2).join('.');
      const text = clean(raw);
      if (chapter && label && text) (chapters[chapter] ??= []).push([label, text]);
    };
    let verse;
    const container = /<verse\s+[^>]*osisID=["']([^"']+)["'][^>]*>([\s\S]*?)<\/verse>/g;
    while ((verse = container.exec(book[2]))) add(verse[1], verse[2]);
    if (!Object.keys(chapters).length) {
      const milestone = /<verse\s+[^>]*(?:sID|osisID)=["']([^"']+)["'][^>]*\/?>([\s\S]*?)(?=<verse\s+[^>]*(?:eID|sID|osisID)=|<\/chapter>|<\/div>)/g;
      while ((verse = milestone.exec(book[2]))) add(verse[1], verse[2]);
    }
    if (code === 'GEN' && !chapters[1]) {
      console.error(`[diagnostic] GEN export sample: ${book[2].slice(0, 1800).replace(/\s+/g, ' ')}`);
    }
    result[code] = { name: code, chapters };
  }
  return result;
}

function assemble(parsed) {
  const meta = JSON.parse(readFileSync(new URL('../src/data/bible-books.json', import.meta.url), 'utf8'));
  const expected = new Map(meta.map((book) => [book.code, book.chapters]));
  return CODES.map((code) => {
    const sourceBook = parsed[code];
    if (!sourceBook) throw new Error(`Source is missing canonical book ${code}`);
    const chapters = Array.from({ length: expected.get(code) }, (_, i) => {
      const chapter = sourceBook.chapters[i + 1];
      if (!Array.isArray(chapter) || !chapter.length) throw new Error(`Source is missing ${code} chapter ${i + 1}`);
      return chapter;
    });
    return { code, name: sourceBook.name, chapters };
  });
}

async function download(url, locale) {
  let status = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, { redirect: 'follow' });
    status = response.status;
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if ((status !== 429 && status < 500) || attempt === 3) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  throw new Error(`[${locale}] CrossWire download failed: HTTP ${status}`);
}

async function build(locale) {
  const source = CROSSWIRE_PD_FALLBACKS[locale];
  if (!source) throw new Error(`No CrossWire fallback pin for locale: ${locale}`);
  const url = crossWireRawZipUrl(source.module);
  const bytes = await download(url, locale);
  const base = process.env.BIBLE_PACK_TMPDIR || tmpdir();
  if (!existsSync(base)) mkdirSync(base, { recursive: true });
  const work = mkdtempSync(join(base, `lumen-crosswire-${locale}-`));
  const zipPath = join(work, `${source.module}.zip`);
  writeFileSync(zipPath, bytes);
  const unzip = spawnSync('unzip', ['-q', zipPath, '-d', work], { encoding: 'utf8' });
  if (unzip.status !== 0) throw new Error(`unzip failed: ${unzip.stderr || unzip.stdout}`);
  const exported = spawnSync('mod2osis', [source.module], {
    cwd: work,
    env: { ...process.env, SWORD_PATH: work },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (exported.error) throw exported.error;
  if (exported.status !== 0) throw new Error(`mod2osis failed: ${exported.stderr || exported.stdout}`);
  if (process.env.CROSSWIRE_DEBUG === '1' && locale === 'da') {
    console.error(`[diagnostic] raw OSIS head: ${exported.stdout.slice(0, 5000).replace(/\s+/g, ' ')}`);
  }
  const books = assemble(parseOsis(exported.stdout));
  const verseCount = books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.length, 0), 0);
  const pack = {
    schemaVersion: SCHEMA_VERSION,
    locale,
    edition: source.edition,
    credit: `${source.edition} · Public Domain · CrossWire SWORD`,
    sourceUrl: url,
    sourceDetailsUrl: crossWireInfoUrl(source.module),
    sourceSha256: sha256(bytes),
    generatedAt: new Date().toISOString(),
    rightsStatus: 'verified-upstream-public-domain',
    books,
  };
  const output = Buffer.from(JSON.stringify(pack));
  const outDir = new URL('../dist/bible-packs/', import.meta.url);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir.pathname, `${locale}.json`);
  writeFileSync(outPath, output);
  writeFileSync(`${outPath}.sha256`, `${sha256(output)}  ${locale}.json\n`);
  console.log(`[${locale}] ${source.module} · 66 books · ${verseCount} verses · ${output.length} bytes`);
}

const requested = process.argv[2];
if (!requested) {
  console.error('Usage: node scripts/build-crosswire-pack.mjs <locale|all>');
  process.exit(2);
}
if (requested !== 'all') await build(requested);
else {
  const failures = [];
  for (const locale of Object.keys(CROSSWIRE_PD_FALLBACKS)) {
    try { await build(locale); }
    catch (error) {
      failures.push([locale, error instanceof Error ? error.message : String(error)]);
      console.error(`[${locale}] BLOCKED: ${failures.at(-1)[1]}`);
    }
  }
  if (failures.length) {
    for (const [locale, message] of failures) console.error(`- ${locale}: ${message}`);
    process.exitCode = 1;
  }
}
