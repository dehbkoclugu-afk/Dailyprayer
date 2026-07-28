import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { translations, type Locale } from './translations.ts';

// Taken from the dictionaries rather than imported from ./index, which reaches
// expo-localization and cannot be loaded by the plain Node test runner.
const LOCALES = Object.keys(translations) as Locale[];

/**
 * Guards roadmap items 34 and 35: an accessibility label is a sentence, and a
 * sentence belongs to a language.
 *
 * Labels were assembled at the call site out of English fragments and values —
 * `${count} day streak${litToday ? ', completed today' : ''}`, `${done} of
 * ${total} completed today`, `Verse of the day, ${verse.reference}`,
 * `${p.title}, requires Plus`. Five of them never went near a translation, so a
 * Turkish reader heard English; the one that did was still built to English word
 * order, which is the deeper problem. "3 of 4 completed today" in Turkish is
 * "bugün 4 adımın 3'ü tamamlandı" — the numbers swap places and the verb moves
 * to the end. Concatenating translated fragments cannot produce that.
 *
 * So the whole sentence is one key with the values marked in it, and the rules
 * here are about keeping it that way.
 */

const ROOTS = ['app', 'src'];

/** Words that only appear in a label if someone wrote English into the source. */
const ENGLISH_FRAGMENTS = [
  /\brequires Plus\b/,
  /\bday streak\b/,
  /\bcompleted today\b/,
  /\bVerse of the day\b/,
  /,\s*locked\b/,
  /\bof \$\{/,
];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

/** The braced value of a prop, read by depth — templates contain `}`. */
function bracedValue(source: string, from: number): string {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(from, i + 1);
    }
  }
  return source.slice(from);
}

function accessibilityStrings(source: string): { value: string; line: number }[] {
  const out: { value: string; line: number }[] = [];
  for (const match of source.matchAll(/accessibility(?:Label|Hint)=\{/g)) {
    out.push({
      value: bracedValue(source, match.index + match[0].length - 1),
      line: source.slice(0, match.index).split('\n').length,
    });
  }
  return out;
}

test('no accessibility label is built out of English words', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const { value, line } of accessibilityStrings(source)) {
      for (const fragment of ENGLISH_FRAGMENTS) {
        if (fragment.test(value)) offenders.push(`${file}:${line} ${value.slice(0, 70)}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `English written into accessibility labels:\n${offenders.join('\n')}\n` +
      'Use tf()/tfn() with a key that holds the whole sentence.',
  );
});

test('every placeholder survives into every language', () => {
  // A translator dropping {count} loses the number silently: the label still
  // reads as a sentence, just not the one the screen is showing.
  const offenders: string[] = [];
  const placeholders = (text: string) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  for (const [key, english] of Object.entries(translations.en)) {
    if (typeof english !== 'string') continue;
    const expected = placeholders(english);
    if (expected.length === 0) continue;
    for (const locale of LOCALES) {
      if (locale === 'en') continue;
      const value = (translations[locale] as Record<string, string>)[key];
      if (value === undefined) continue;
      const got = placeholders(value);
      if (got.join(',') !== expected.join(',')) {
        offenders.push(`${locale} ${key}: expected {${expected.join('} {')}}, got {${got.join('} {')}}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `placeholders lost in translation:\n${offenders.join('\n')}`);
});

test('a counted sentence has a singular form in every language', () => {
  // tn()/tfn() reach for `<key>.one` at exactly one. A language that has the
  // plural but not the singular says "1 días seguidos".
  const counted = Object.keys(translations.en).filter((key) => key.endsWith('.one'));
  assert.ok(counted.length > 0, 'no counted sentences — this guard would test nothing');

  const offenders: string[] = [];
  for (const singular of counted) {
    const plural = singular.slice(0, -'.one'.length);
    for (const locale of LOCALES) {
      const dict = translations[locale] as Record<string, string>;
      if (dict[plural] === undefined) offenders.push(`${locale}: ${singular} has no plural form`);
      if (dict[singular] === undefined) offenders.push(`${locale}: ${plural} has no singular form`);
    }
  }
  assert.deepEqual(offenders, [], `incomplete count forms:\n${offenders.join('\n')}`);
});

test('the languages that inflect on one actually do', () => {
  // en and de say "1 day streak" and "1 Tag in Folge" — the noun changes in de,
  // not in en. What must never happen is a language where the two forms are
  // identical *and* the plural is visibly plural.
  const romance = ['es', 'pt', 'fr'] as const;
  for (const locale of romance) {
    const dict = translations[locale] as Record<string, string>;
    assert.notEqual(
      dict['a11y.streak'],
      dict['a11y.streak.one'],
      `${locale} uses one form for both counts`,
    );
  }
});

test('the sentences reach the screens that lost their English', () => {
  const cases: [string, RegExp][] = [
    ['src/components/VerseCard.tsx', /tf\('a11y\.verseOfDay', \{ ref/],
    ['src/components/StreakFlame.tsx', /tfn\(count, litToday \? 'a11y\.streakLitToday' : 'a11y\.streak'/],
    ['src/components/ProgressRing.tsx', /tfn\(total, 'a11y\.ritualProgress'/],
    ['src/components/RitualCard.tsx', /tf\('a11y\.lockedItem', \{ title \}\)/],
    ['app/(tabs)/bible.tsx', /tf\('a11y\.requiresPlus', \{ title: p\.title \}\)/],
    ['app/(tabs)/today.tsx', /tfn\(count, 'a11y\.streak'/],
  ];
  for (const [file, pattern] of cases) {
    assert.match(readFileSync(file, 'utf8'), pattern, `${file} stopped using its translated sentence`);
  }
});

test('Turkish really does reorder, so the sentence key earns its keep', () => {
  // If every language put the values in English order, a template literal would
  // have been fine and this machinery would be overhead. It does not.
  const english = translations.en['a11y.ritualProgress'];
  const turkish = translations.tr['a11y.ritualProgress'];
  const order = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  assert.deepEqual(order(english), ['done', 'total']);
  assert.deepEqual(order(turkish), ['total', 'done']);
});
