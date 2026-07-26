/**
 * Upstream drift check (roadmap item 13, network half).
 *
 * `check-scripture-integrity.mjs` proves the bundle is what we recorded. It cannot
 * tell you the publisher has since corrected the text. eBible.org states the
 * Turkish YTC is still under review ("Bu İncil tercümesi kontrol ediliyor"), and a
 * 4-verse drift was found this way on 2026-07-26 — so this has to be re-run, not
 * assumed.
 *
 *   npm run scripture-drift
 *
 * Needs network, so it is deliberately NOT in CI: a publisher outage must not fail
 * unrelated builds. Run it before a release, and after it reports drift decide
 * whether to re-export (see docs/scripture-sources.md).
 *
 * Exit 0 = the bundled text matches the current upstream artifact.
 * Exit 1 = drift, with every differing verse printed.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Only editions whose publisher actively revises them need checking. The other
 * five are historical texts pinned to an immutable upstream blob, verified by
 * check-scripture-integrity.mjs.
 */
const WATCHED = [
  {
    locale: 'tr',
    edition: 'Yorumsuz Türkçe Çeviri (YTC)',
    url: 'https://ebible.org/Scriptures/turytc_vpl.zip',
    member: 'turytc_vpl.xml',
    bundled: 'src/data/bible-full.tr.json',
    /** Same parse as scripts/build-bible.mjs, so a difference means the text moved. */
    parse(xml) {
      const byBook = {};
      const re = /<v b="([A-Z0-9]+)" c="(\d+)" v="([0-9-]+)">([\s\S]*?)<\/v>/g;
      let m;
      while ((m = re.exec(xml))) {
        const [, code, ch, label, raw] = m;
        const text = raw.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        ((byBook[code] ??= {})[Number(ch)] ??= []).push([label, text]);
      }
      return byBook;
    },
  },
];

let drifted = false;

for (const source of WATCHED) {
  console.log(`Checking ${source.edition} (${source.locale}) against ${source.url}`);

  const dir = mkdtempSync(join(tmpdir(), 'scripture-drift-'));
  const zip = join(dir, 'upstream.zip');
  let xml;
  try {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    writeFileSync(zip, Buffer.from(await response.arrayBuffer()));
    execFileSync('unzip', ['-o', '-q', zip, source.member, '-d', dir]);
    xml = readFileSync(join(dir, source.member), 'utf8');
  } catch (error) {
    console.error(`  could not fetch the upstream artifact: ${error.message}`);
    console.error('  This check needs network access. Re-run before release.');
    process.exit(2);
  }

  console.log(`  artifact SHA-256: ${createHash('sha256').update(readFileSync(zip)).digest('hex')}`);

  const upstream = source.parse(xml);
  const bundled = JSON.parse(readFileSync(source.bundled, 'utf8')).books;

  let compared = 0;
  const differences = [];
  for (const book of bundled) {
    const upstreamBook = upstream[book.code] ?? {};
    book.chapters.forEach((chapter, index) => {
      const upstreamChapter = upstreamBook[index + 1] ?? [];
      chapter.forEach(([label, text], position) => {
        compared += 1;
        const other = upstreamChapter[position];
        if (!other) {
          differences.push({ ref: `${book.code} ${index + 1}:${label}`, bundled: text, upstream: '(absent)' });
        } else if (other[0] !== label || other[1] !== text) {
          differences.push({ ref: `${book.code} ${index + 1}:${label}`, bundled: text, upstream: other[1] });
        }
      });
    });
  }

  console.log(`  ${bundled.length} books, ${compared} verses compared`);
  if (differences.length === 0) {
    console.log('  no drift\n');
    continue;
  }

  drifted = true;
  console.error(`  DRIFT: ${differences.length} verse(s) differ from current upstream`);
  for (const difference of differences) {
    console.error(`    ${difference.ref}`);
    console.error(`      bundled:  ${difference.bundled}`);
    console.error(`      upstream: ${difference.upstream}`);
  }
  console.error('');
}

if (drifted) {
  console.error(
    'The publisher has revised the text since our export. We did not change it.\n' +
      'Decide deliberately: re-export verbatim from the current artifact (permitted by\n' +
      'docs/scripture-integrity.md as "a newly verified verbatim export of the same\n' +
      'approved edition"), then update the manifest table in docs/scripture-sources.md\n' +
      'with the new SHA-256 and verse count — or record why the older revision stays.',
  );
  process.exit(1);
}

console.log('No upstream drift — every watched edition matches its publisher’s current text.');
