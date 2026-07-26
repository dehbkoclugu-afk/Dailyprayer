import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  GOSPEL_CODES,
  flatten,
  planReadingFrom,
  type ChapterCounts,
} from './planReadings.logic.ts';

/**
 * The bug this guards: reading plans were scheduled from one edition's chapter
 * counts for every language. Luther 1912 follows the Hebrew versification — German
 * Joel has 4 chapters and Malachi 3, where the other five have 3 and 4 — so a
 * German plan scheduled a Malachi 4 that does not exist and never reached German
 * Joel 4. The totals both come to 1189, so nothing looked wrong.
 */

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'] as const;
const PLANS = ['peace-7', 'gratitude-7', 'psalms-30', 'gospels-90', 'bible-365'];

const chapterData = JSON.parse(readFileSync('src/data/bible-chapters.json', 'utf8')) as Record<
  string,
  Record<string, number>
>;
const ORDER = Object.keys(chapterData);

const countsFor = (locale: string): ChapterCounts =>
  Object.fromEntries(ORDER.map((code) => [code, chapterData[code][locale]]));

/** Chapter counts straight from the bundled text — the edition the reader opens. */
function countsFromBundle(locale: string): ChapterCounts {
  const { books } = JSON.parse(readFileSync(`src/data/bible-full.${locale}.json`, 'utf8'));
  return Object.fromEntries(books.map((b: { code: string; chapters: unknown[] }) => [b.code, b.chapters.length]));
}

test('the chapter metadata matches the bundled text for every locale', () => {
  // If this drifts, every plan schedules against a layout the reader does not have.
  for (const locale of LOCALES) {
    assert.deepEqual(
      countsFor(locale),
      countsFromBundle(locale),
      `${locale}: bible-chapters.json disagrees with bible-full.${locale}.json — ` +
        `re-run scripts/build-bible-chapters.mjs`,
    );
  }
});

test('the known versification difference is real and only where expected', () => {
  for (const code of ORDER) {
    const values = new Set(LOCALES.map((l) => chapterData[code][l]));
    if (code === 'JOL' || code === 'MAL') continue;
    assert.equal(values.size, 1, `${code} unexpectedly differs between editions`);
  }
  assert.equal(chapterData.JOL.de, 4);
  assert.equal(chapterData.MAL.de, 3);
  for (const locale of ['tr', 'en', 'es', 'pt', 'fr'] as const) {
    assert.equal(chapterData.JOL[locale], 3);
    assert.equal(chapterData.MAL[locale], 4);
  }
});

test('every plan schedules only chapters that exist in that locale', () => {
  for (const locale of LOCALES) {
    const counts = countsFromBundle(locale);
    const gospels = flatten(GOSPEL_CODES, ORDER, counts);
    const all = flatten(ORDER, ORDER, counts);

    for (const planId of PLANS) {
      for (let day = 0; day < 365; day += 1) {
        const reading = planReadingFrom(planId, day, ORDER, counts, gospels, all);
        for (const [book, chapter, side] of [
          [reading.book, reading.chapter, 'start'],
          [reading.endBook, reading.endChapter, 'end'],
        ] as const) {
          const code = ORDER[book];
          assert.ok(code, `${locale}/${planId} day ${day}: ${side} book index ${book} is out of range`);
          assert.ok(
            chapter >= 0 && chapter < counts[code],
            `${locale}/${planId} day ${day}: ${side} ${code} ${chapter + 1} does not exist ` +
              `(that edition has ${counts[code]} chapters)`,
          );
        }
      }
    }
  }
});

test('the German plan reaches Joel 4 and never schedules Malachi 4', () => {
  const counts = countsFromBundle('de');
  const all = flatten(ORDER, ORDER, counts);
  const gospels = flatten(GOSPEL_CODES, ORDER, counts);
  const joel = ORDER.indexOf('JOL');
  const malachi = ORDER.indexOf('MAL');

  const covered = new Set<string>();
  for (let day = 0; day < 365; day += 1) {
    const reading = planReadingFrom('bible-365', day, ORDER, counts, gospels, all);
    // The day covers a contiguous run of the flattened list; walk it.
    const startIndex = all.findIndex(([b, c]) => b === reading.book && c === reading.chapter);
    const endIndex = all.findIndex(([b, c]) => b === reading.endBook && c === reading.endChapter);
    for (let i = startIndex; i <= endIndex; i += 1) covered.add(all[i].join(':'));
  }

  assert.ok(covered.has(`${joel}:3`), 'German Joel 4 must be scheduled');
  assert.ok(!covered.has(`${malachi}:3`), 'German Malachi 4 does not exist and must not be scheduled');
  assert.ok(covered.has(`${malachi}:2`), 'German Malachi 3 must be scheduled');
});

test('the other editions still schedule Malachi 4 and stop at Joel 3', () => {
  for (const locale of ['tr', 'en', 'es', 'pt', 'fr'] as const) {
    const counts = countsFromBundle(locale);
    assert.equal(counts.MAL, 4, `${locale} should have Malachi 4`);
    assert.equal(counts.JOL, 3, `${locale} should have Joel 3`);
  }
});
