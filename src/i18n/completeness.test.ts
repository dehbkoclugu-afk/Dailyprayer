import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { translations } from './translations.ts';

/**
 * The dictionary claims six languages. Nothing was checking that.
 *
 * `TranslationKey` is `keyof translations['en']`, so TypeScript only guarantees
 * that a *key* exists in English — a key missing from Turkish compiles fine, and
 * `lookup()` quietly falls back to the English string. That is the right runtime
 * behaviour (better English than a blank label) and exactly the wrong thing to
 * rely on, because the app then ships English text with no sign that it has.
 *
 * It had happened, and not in a corner: every non-English locale was missing 21
 * or 22 of 323 keys — the whole guided-prayer player, the paywall's processing
 * and restore copy, and the daily notification title and body. A Turkish user
 * with reminders on got an English push notification every morning.
 */

const LOCALES = Object.keys(translations) as (keyof typeof translations)[];
const dict = (locale: keyof typeof translations) =>
  translations[locale] as Record<string, string>;

test('the app ships six locales', () => {
  assert.deepEqual(LOCALES.sort(), ['de', 'en', 'es', 'fr', 'pt', 'tr']);
});

test('every locale carries every key', () => {
  const english = Object.keys(translations.en);
  const gaps: string[] = [];
  for (const locale of LOCALES) {
    const missing = english.filter((key) => !(key in dict(locale)));
    if (missing.length) gaps.push(`${locale} is missing ${missing.length}: ${missing.join(', ')}`);
  }
  assert.deepEqual(gaps, [], `translations fall back to English:\n${gaps.join('\n')}`);
});

test('no locale carries a key English does not', () => {
  // A key only a translation has can never be reached: TranslationKey comes from
  // English, so nothing can ask for it.
  const english = Object.keys(translations.en);
  const orphans: string[] = [];
  for (const locale of LOCALES) {
    const extra = Object.keys(dict(locale)).filter((key) => !english.includes(key));
    if (extra.length) orphans.push(`${locale}: ${extra.join(', ')}`);
  }
  assert.deepEqual(orphans, [], `unreachable keys:\n${orphans.join('\n')}`);
});

test('no value is left as the English string in another locale', () => {
  // A key copied across without being translated is the same failure as a missing
  // one, just harder to see. Short shared words are legitimately identical in
  // several languages ("Pause", "Amen", "Natural"), so this only looks at values
  // long enough for a coincidence to be implausible.
  const suspects: string[] = [];
  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    for (const [key, value] of Object.entries(dict(locale))) {
      const english = (translations.en as Record<string, string>)[key];
      if (value === english && value.length > 24) suspects.push(`${locale} ${key}: "${value}"`);
    }
  }
  assert.deepEqual(
    suspects,
    [],
    `left in English:\n${suspects.join('\n')}\n` +
      'If a value really is identical in this language, it is short enough not to trip this.',
  );
});

test('no credit line lives in a translation', () => {
  // docs/scripture-integrity.md: a rights claim belongs in
  // src/data/scriptureRights.ts and nowhere else. A `bible.credit` string naming
  // an edition, a copyright holder and a licence had been sitting here — stale,
  // unreferenced, and in the wrong dictionary: the *English* entry named the
  // Turkish edition. The live credit comes from getBibleCredit().
  //
  // What this looks for is a credit line's fingerprint — a copyright notice or a
  // licence identifier. It is deliberately not "any mention of a licensor": the
  // `source.conditions.*` keys are the licence obligations translated for the
  // reader, which those licences require us to show, and they name eBible.org on
  // purpose.
  const offenders: string[] = [];
  for (const locale of LOCALES) {
    for (const [key, value] of Object.entries(dict(locale))) {
      if (/©|\bCC BY\b/.test(value)) offenders.push(`${locale} ${key}: "${value}"`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `credit lines in translations — they belong in src/data/scriptureRights.ts:\n${offenders.join('\n')}`,
  );
});

test('a singular form exists in every locale or in none', () => {
  // `lookupCount` decides whether a `<key>.one` exists by asking the *English*
  // dictionary, so a singular that only some locales have would silently give
  // those locales English. Completeness above already catches that, but this says
  // what the pairing rule is, and that every `.one` has a plural to pair with.
  const english = Object.keys(translations.en);
  const singulars = english.filter((key) => key.endsWith('.one'));
  assert.ok(singulars.length > 0, 'expected at least one counted noun');
  for (const singular of singulars) {
    const plural = singular.slice(0, -'.one'.length);
    assert.ok(english.includes(plural), `${singular} has no plural ${plural}`);
  }
});

test('a counted noun is never read with the plain translator', () => {
  // The bug this replaces: `{n} {tr('bible.days')}` printed "1 días". Any label
  // that has a singular form must be reached through `tn`.
  const singulars = Object.keys(translations.en)
    .filter((key) => key.endsWith('.one'))
    .map((key) => key.slice(0, -'.one'.length));
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) {
        const source = readFileSync(path, 'utf8');
        for (const key of singulars) {
          if (source.includes(`tr('${key}')`)) offenders.push(`${path}: tr('${key}')`);
        }
      }
    }
  };
  for (const root of ['app', 'src']) walk(root);
  assert.deepEqual(
    offenders,
    [],
    `counted nouns read without a count — use tn(n, key):\n${offenders.join('\n')}`,
  );
});

test('every key the app asks for exists', () => {
  // The other direction: a `tr('...')` for a key that was renamed away.
  // Template keys like `player.pace.${pace}` are resolved by prefix.
  const used = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
        const source = readFileSync(path, 'utf8');
        for (const [, key] of source.matchAll(/\b(?:tr|t|translate)\('([a-z][\w.]*)'\)/gi)) {
          used.add(key);
        }
        // `tn(count, 'key')` — the count-aware form.
        for (const [, key] of source.matchAll(/\btn\([^,]+,\s*'([a-z][\w.]*)'\)/gi)) {
          used.add(key);
        }
      }
    }
  };
  for (const root of ['app', 'src']) walk(root);

  const english = Object.keys(translations.en);
  const unknown = [...used].filter(
    (key) => !english.includes(key) && !english.some((k) => k.startsWith(`${key}.`)),
  );
  assert.deepEqual(unknown, [], `keys used in the app but absent from the dictionary:\n${unknown.join('\n')}`);
  // Guard against the scan silently matching nothing.
  assert.ok(used.size > 100, `expected the scan to find keys, found ${used.size}`);
});
