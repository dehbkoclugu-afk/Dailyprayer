/**
 * Scripture integrity release check (roadmap item 13).
 *
 * A wrong or silently altered verse is not a bug, it is a breach of trust
 * (`docs/scripture-integrity.md`). This check makes that enforceable: the manifest
 * table in `docs/scripture-sources.md` is the authority, and a change to bundled
 * Scripture is only accepted when that table is updated in the same commit.
 *
 *   npm run scripture-check
 *
 * Offline and deterministic, so it runs on every push. For upstream drift — a
 * publisher revising the text after our export — see check-scripture-drift.mjs.
 *
 * Exit 0 = every bundled edition matches the manifest and is structurally sound.
 * Exit 1 = stop. The report says which file, what changed, and what to do.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const MANIFEST_DOC = 'docs/scripture-sources.md';
const REGISTRY = 'src/data/scriptureRights.ts';

// Canonical 66-book order. The generators emit exactly this, in this order.
const CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK',
  'JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT',
  'PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
];

const failures = [];
const fail = (message) => failures.push(message);

/** Parse the manifest table between the scripture-manifest markers. */
function readManifest() {
  const doc = readFileSync(MANIFEST_DOC, 'utf8');
  const block = doc.match(/<!-- scripture-manifest:start -->([\s\S]*?)<!-- scripture-manifest:end -->/);
  if (!block) {
    console.error(`${MANIFEST_DOC}: manifest markers are missing. The check cannot run without them.`);
    process.exit(1);
  }
  const rows = [];
  const rowRe = /^\|\s*([a-z]{2})\s*\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|$/;
  for (const line of block[1].split('\n')) {
    const m = line.trim().match(rowRe);
    if (m) {
      rows.push({
        locale: m[1],
        file: m[2],
        sha256: m[3],
        books: Number(m[4]),
        chapters: Number(m[5]),
        verses: Number(m[6]),
      });
    }
  }
  if (rows.length !== 6) {
    console.error(`${MANIFEST_DOC}: expected 6 manifest rows, parsed ${rows.length}.`);
    process.exit(1);
  }
  return rows;
}

/** Credits declared in the rights registry, so the JSON cannot drift from them. */
function registryCredits() {
  const src = readFileSync(REGISTRY, 'utf8');
  const credits = {};
  const blockRe = /^ {2}([a-z]{2}): \{$/gm;
  let m;
  while ((m = blockRe.exec(src))) {
    const locale = m[1];
    const rest = src.slice(m.index);
    const credit = rest.match(/credit: '((?:[^'\\]|\\.)*)'/);
    if (credit) credits[locale] = credit[1].replace(/\\'/g, "'");
  }
  return credits;
}

const manifest = readManifest();
const credits = registryCredits();
const shape = [];

for (const row of manifest) {
  const { locale, file } = row;
  if (!existsSync(file)) {
    fail(`[${locale}] ${file} is missing but the manifest lists it.`);
    continue;
  }

  const raw = readFileSync(file);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  if (sha256 !== row.sha256) {
    fail(
      `[${locale}] ${file} does not match the manifest.\n` +
        `        manifest: ${row.sha256}\n` +
        `        actual:   ${sha256}`,
    );
  }

  let data;
  try {
    data = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    fail(`[${locale}] ${file} is not valid JSON: ${error.message}`);
    continue;
  }

  const books = data.books ?? [];
  const chapters = books.reduce((n, b) => n + b.chapters.length, 0);
  const verses = books.reduce(
    (n, b) => n + b.chapters.reduce((m, c) => m + c.length, 0),
    0,
  );
  shape.push({
    locale,
    chapters: Object.fromEntries(books.map((b) => [b.code, b.chapters.length])),
  });

  if (books.length !== row.books) fail(`[${locale}] ${books.length} books, manifest says ${row.books}.`);
  if (chapters !== row.chapters) fail(`[${locale}] ${chapters} chapters, manifest says ${row.chapters}.`);
  if (verses !== row.verses) {
    fail(
      `[${locale}] ${verses} verses, manifest says ${row.verses}. ` +
        `A verse count change means text was added or lost — confirm against the upstream edition.`,
    );
  }

  // Canonical order, exactly the 66 books, nothing else.
  const codes = books.map((b) => b.code);
  if (codes.join(',') !== CODES.join(',')) {
    const missing = CODES.filter((c) => !codes.includes(c));
    const extra = codes.filter((c) => !CODES.includes(c));
    fail(
      `[${locale}] book list is not the canonical 66 in order.` +
        (missing.length ? ` missing: ${missing.join(',')}` : '') +
        (extra.length ? ` unexpected: ${extra.join(',')}` : ''),
    );
  }

  // Nothing empty, nothing left over from parsing, no book without a name.
  for (const book of books) {
    if (!book.name || !book.name.trim()) fail(`[${locale}] ${book.code} has no localized name.`);
    book.chapters.forEach((chapter, index) => {
      if (chapter.length === 0) fail(`[${locale}] ${book.code} ${index + 1} is empty.`);
      for (const [label, text] of chapter) {
        if (!label || !String(label).trim()) fail(`[${locale}] ${book.code} ${index + 1} has a verse with no label.`);
        if (!text || !text.trim()) fail(`[${locale}] ${book.code} ${index + 1}:${label} has no text.`);
        else if (/[<>]|&[a-z]+;|\\[nt]|\b[HG]\d{3,5}\b/.test(text)) {
          fail(`[${locale}] ${book.code} ${index + 1}:${label} carries parser leftovers: ${text.slice(0, 60)}`);
        }
      }
    });
  }

  // The credit frozen in the JSON must agree with the rights registry the app reads.
  if (credits[locale] && data.credit !== credits[locale]) {
    fail(
      `[${locale}] JSON credit and the rights registry disagree.\n` +
        `        JSON:     ${data.credit}\n` +
        `        registry: ${credits[locale]}`,
    );
  }
}

/**
 * Editions may divide books differently, and one of ours does: Luther 1912 follows
 * the Hebrew versification, giving Joel 4 chapters (others have 3) and Malachi 3
 * (others have 4). The totals still come to 1189, which is why this went unnoticed.
 * Known divergences are declared here so they stay visible and any *new* one fails.
 */
const KNOWN_CHAPTER_DIVERGENCE = {
  de: { JOL: 4, MAL: 3 },
};

const base = shape.find((entry) => entry.locale === 'tr');
for (const entry of shape) {
  if (!base || entry.locale === base.locale) continue;
  const expected = KNOWN_CHAPTER_DIVERGENCE[entry.locale] ?? {};
  for (const [code, baseCount] of Object.entries(base.chapters)) {
    const actual = entry.chapters[code];
    const allowed = expected[code] ?? baseCount;
    if (actual !== allowed) {
      fail(
        `[${entry.locale}] ${code} has ${actual} chapters; expected ${allowed}` +
          `${expected[code] ? ' (declared versification difference)' : ` (same as ${base.locale})`}. ` +
          `If this edition genuinely divides ${code} differently, declare it in ` +
          `KNOWN_CHAPTER_DIVERGENCE — a reference will not resolve across languages until you do.`,
      );
    }
  }
}

// Navigation metadata has to cover the same canon.
for (const [file, extract] of [
  ['src/data/bible-books.json', (json) => json.map((b) => b.code)],
  ['src/data/bible-book-names.json', (json) => Object.keys(json)],
]) {
  if (!existsSync(file)) {
    fail(`${file} is missing.`);
    continue;
  }
  const codes = extract(JSON.parse(readFileSync(file, 'utf8')));
  const missing = CODES.filter((c) => !codes.includes(c));
  if (missing.length) fail(`${file} is missing books: ${missing.join(',')}`);
}

if (failures.length) {
  console.error(`Scripture integrity check FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(
    '\nScripture data is immutable source data (docs/scripture-integrity.md). If you\n' +
      'changed it deliberately — a newly verified verbatim export of the same approved\n' +
      'edition — update the manifest table in docs/scripture-sources.md in the same\n' +
      'commit, recording why the hash changed. If you did not change it deliberately,\n' +
      'restore the file: something altered Scripture.',
  );
  process.exit(1);
}

console.log(
  `Scripture integrity check passed — ${manifest.length} editions match the manifest ` +
    `in ${MANIFEST_DOC}.`,
);
