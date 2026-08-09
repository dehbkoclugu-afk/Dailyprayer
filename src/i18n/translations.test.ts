import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveGlobalLocale } from './globalLanguageCatalog.ts';
import {
  APPLICATION_LOCALES,
  SUPPORTED_LOCALES,
  resolveApplicationLocale,
} from './applicationLocales.ts';
import { translations } from './translations.ts';

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

test('application locale resolution uses full BCP-47 tags and safe fallback', () => {
  assert.equal(resolveApplicationLocale('tr-TR', 'tr'), 'tr');
  assert.equal(resolveApplicationLocale('it-IT', 'it'), 'it');
  assert.equal(resolveApplicationLocale('nl-NL', 'nl'), 'nl');
  assert.equal(resolveApplicationLocale('zh-Hant-TW', 'zh'), 'en');
  assert.equal(resolveApplicationLocale('sr-Latn-RS', 'sr'), 'en');
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
