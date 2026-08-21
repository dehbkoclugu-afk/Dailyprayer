import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  resolveGlobalLocale,
} from './globalLanguageCatalog.ts';
import {
  APPLICATION_LOCALES,
  APPLICATION_LOCALE_CANDIDATES,
  PENDING_NATIVE_APPLICATION_LOCALES,
  RTL_APPLICATION_LOCALE_CANDIDATES,
  SUPPORTED_LOCALES,
  resolveApplicationLocale,
} from './applicationLocales.ts';
import { translations } from './translations.ts';
import { testamentLabels } from './testamentLabels.ts';

test('every advertised app locale has complete UI chrome', () => {
  const sourceKeys = Object.keys(translations.en).sort();
  for (const [locale, dictionary] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(dictionary).sort(), sourceKeys, `${locale} must not fall back for UI chrome`);
  }
});

test('application locale catalog and translation dictionaries stay in canonical parity', () => {
  assert.deepEqual(Object.keys(translations).sort(), [...SUPPORTED_LOCALES].sort());
  assert.deepEqual(
    APPLICATION_LOCALES.map((locale) => locale.tag),
    SUPPORTED_LOCALES,
  );
  assert.equal(new Set(SUPPORTED_LOCALES).size, SUPPORTED_LOCALES.length);
});

test('testament navigation is localized for every advertised application locale', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const [oldTestament, newTestament] = testamentLabels(locale);
    assert.ok(oldTestament.length > 0, `${locale} needs an Old Testament label`);
    assert.ok(newTestament.length > 0, `${locale} needs a New Testament label`);
  }
});

test('application rollout targets the 40 release candidates plus Turkish', () => {
  assert.equal(APPLICATION_LOCALE_CANDIDATES.length, 41);
  assert.deepEqual(
    new Set(APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag)),
    new Set([...RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS, 'tr']),
  );
  assert.equal(
    new Set(APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag)).size,
    APPLICATION_LOCALE_CANDIDATES.length,
  );
});

test('advertises exactly the 38 release-ready locales', () => {
  assert.equal(APPLICATION_LOCALES.length, 38);
  assert.deepEqual(
    new Set(APPLICATION_LOCALES.map(({ tag }) => tag)),
    new Set(
      APPLICATION_LOCALE_CANDIDATES
        .map(({ tag }) => tag)
        .filter((tag) => !(PENDING_NATIVE_APPLICATION_LOCALES as readonly string[]).includes(tag)),
    ),
  );
  assert.deepEqual(new Set(PENDING_NATIVE_APPLICATION_LOCALES), new Set(['cek', 'hlt', 'kos']));
});

test('only Arabic and Persian rollout candidates use RTL', () => {
  assert.deepEqual(new Set(RTL_APPLICATION_LOCALE_CANDIDATES), new Set(['ar', 'fa']));
});

test('application locale resolution uses full BCP-47 tags and safe fallback', () => {
  assert.equal(resolveApplicationLocale('tr-TR', 'tr'), 'tr');
  assert.equal(resolveApplicationLocale('it-IT', 'it'), 'it');
  assert.equal(resolveApplicationLocale('nl-NL', 'nl'), 'nl');
  assert.equal(resolveApplicationLocale('zh-Hant-TW', 'zh'), 'zh-Hant');
  assert.equal(resolveApplicationLocale('sr-Latn-RS', 'sr'), 'sr-Latn');
  assert.equal(resolveApplicationLocale('cek', 'cek'), 'en');
  assert.equal(resolveApplicationLocale('xx-ZZ', 'xx'), 'en');
});

test('device locale resolution preserves Chinese and Serbian script variants', () => {
  assert.equal(resolveGlobalLocale('zh-CN', 'zh'), 'zh-Hans');
  assert.equal(resolveGlobalLocale('zh-Hant-TW', 'zh'), 'zh-Hant');
  assert.equal(resolveGlobalLocale('zh-HK', 'zh'), 'zh-Hant');
  assert.equal(resolveGlobalLocale('sr-Latn-RS', 'sr'), 'sr-Latn');
  assert.equal(resolveGlobalLocale('sr-Cyrl-RS', 'sr'), 'sr-Cyrl');
  assert.equal(resolveGlobalLocale('ar-TR', 'ar'), 'ar');
  assert.equal(resolveGlobalLocale('xx-ZZ', 'xx'), 'en');
});
