#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { EBIBLE_PACK_SOURCES } from './ebible-pack-sources.mjs';
import { CROSSWIRE_PD_FALLBACKS } from './crosswire-pack-sources.mjs';
import { OPEN_BIBLES_PACK_SOURCES } from './openbibles-pack-sources.mjs';

const catalogSource = readFileSync('src/i18n/globalLanguageCatalog.ts', 'utf8');
const bundledSource = readFileSync('src/i18n/scripture.ts', 'utf8');
const releaseLocales = [
  ...Object.keys(EBIBLE_PACK_SOURCES).filter((locale) => locale !== 'ko'),
  ...Object.keys(CROSSWIRE_PD_FALLBACKS),
  'ru',
  'mi',
];

if (releaseLocales.length !== 40 || new Set(releaseLocales).size !== 40) {
  throw new Error(`Expected exactly 40 unique production Scripture packs; found ${releaseLocales.length}`);
}

for (const locale of releaseLocales) {
  const row = new RegExp(`\\{ tag: '${locale.replace('-', '\\-')}'[^\\n]+rights: '([^']+)'`).exec(catalogSource);
  if (!row || !row[1].startsWith('verified-')) {
    throw new Error(`${locale} is in the release set without an accepted rights status`);
  }
}

for (const locale of ['ru', 'mi']) {
  const source = OPEN_BIBLES_PACK_SOURCES[locale];
  if (!source || source.structuralStatus !== 'pass') {
    throw new Error(`${locale} Open Bibles source is not structurally approved`);
  }
}

const bundled = /BUNDLED_SCRIPTURE_LOCALES = \[([^\]]+)\]/.exec(bundledSource)?.[1] ?? '';
for (const blocked of ['pt', 'fr']) {
  if (new RegExp(`['\"]${blocked}['\"]`).test(bundled)) {
    throw new Error(`${blocked} ambiguous archived edition must not be bundled for production`);
  }
}

console.log('Scripture release rights verified: 40 pinned packs; ambiguous PT/FR archives gated out');
