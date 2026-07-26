/**
 * Builds src/data/bible-chapters.json — per-locale chapter counts for every book.
 *
 * Editions divide books differently: Luther 1912 follows the Hebrew versification,
 * so German has Joel 4 chapters and Malachi 3 where the other five have 3 and 4.
 * `bible-books.json` carries the Turkish counts only, so anything that schedules or
 * resolves chapters from it (reading plans) was wrong for German in those two books.
 *
 * Derived from the bundled text itself, so it cannot disagree with what the reader
 * loads. Re-run after rebuilding any bible-full.<locale>.json; if you forget,
 * `npm run scripture-check` fails.
 *
 *   node scripts/build-bible-chapters.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'];
const DIR = new URL('../src/data/', import.meta.url).pathname;

const counts = {}; // code -> { locale: chapters }
const order = [];

for (const locale of LOCALES) {
  const { books } = JSON.parse(readFileSync(`${DIR}bible-full.${locale}.json`, 'utf8'));
  for (const book of books) {
    if (!counts[book.code]) {
      counts[book.code] = {};
      order.push(book.code);
    }
    counts[book.code][locale] = book.chapters.length;
  }
}

// Keep the canonical order of the first edition read, so the file diffs cleanly.
const out = {};
for (const code of order) out[code] = counts[code];

writeFileSync(`${DIR}bible-chapters.json`, JSON.stringify(out));

const divergent = order.filter((code) => new Set(Object.values(counts[code])).size > 1);
console.log(`Wrote ${order.length} books -> src/data/bible-chapters.json`);
for (const locale of LOCALES) {
  const total = order.reduce((n, code) => n + counts[code][locale], 0);
  console.log(`  ${locale}: ${total} chapters`);
}
console.log(
  divergent.length
    ? `  versification differences: ${divergent.map((c) => `${c} ${JSON.stringify(counts[c])}`).join(', ')}`
    : '  no versification differences',
);
