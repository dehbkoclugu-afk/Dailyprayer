import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  APPLICATION_LOCALE_CANDIDATES,
  SUPPORTED_LOCALES,
} from '../src/i18n/applicationLocales.ts';
import { translations } from '../src/i18n/translations.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localeDirectory = path.join(root, 'src', 'i18n', 'locales');
const production = process.argv.includes('--production');
const bundled = new Set(SUPPORTED_LOCALES);
const requiredModules = APPLICATION_LOCALE_CANDIDATES
  .map((locale) => locale.tag)
  .filter((locale) => !bundled.has(locale));
const requiredSet = new Set(requiredModules);
const sourceKeys = Object.keys(translations.en).sort();

function interpolationTokens(value) {
  return [...value.matchAll(/\{\{[^}]+\}\}|\$\{[^}]+\}/g)].map((match) => match[0]).sort();
}

function validateDictionary(locale, dictionary) {
  if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) {
    throw new Error(`${locale} must export a dictionary object as default`);
  }
  const keys = Object.keys(dictionary).sort();
  if (JSON.stringify(keys) !== JSON.stringify(sourceKeys)) {
    const missing = sourceKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !sourceKeys.includes(key));
    throw new Error(`${locale} UI key mismatch; missing: ${missing.join(', ')}; extra: ${extra.join(', ')}`);
  }
  for (const key of sourceKeys) {
    const value = dictionary[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${locale}.${key} must be a non-empty string`);
    }
    if (/\b(?:TODO|TRANSLATE_ME|MISSING_TRANSLATION)\b/i.test(value)) {
      throw new Error(`${locale}.${key} contains a translation sentinel`);
    }
    const expectedTokens = interpolationTokens(translations.en[key]);
    const actualTokens = interpolationTokens(value);
    if (JSON.stringify(actualTokens) !== JSON.stringify(expectedTokens)) {
      throw new Error(`${locale}.${key} changed interpolation tokens`);
    }
  }
}

async function main() {
  const filenames = await readdir(localeDirectory).catch(() => []);
  const locales = filenames
    .filter((filename) => filename.endsWith('.ts'))
    .map((filename) => filename.slice(0, -3))
    .sort();
  const unexpected = locales.filter((locale) => !requiredSet.has(locale));
  if (unexpected.length) {
    throw new Error(`Unexpected UI locale modules: ${unexpected.join(', ')}`);
  }

  for (const locale of locales) {
    const module = await import(pathToFileURL(path.join(localeDirectory, `${locale}.ts`)).href);
    validateDictionary(locale, module.default);
  }

  const missing = requiredModules.filter((locale) => !locales.includes(locale));
  if (production && missing.length) {
    throw new Error(`Production UI localization blocked; missing ${missing.length}: ${missing.join(', ')}`);
  }
  console.log(
    `Verified ${locales.length}/${requiredModules.length} new UI locale modules. ` +
      (missing.length ? `Production is NOT ready (${missing.length} missing).` : 'Production UI coverage is complete.'),
  );
}

await main();
