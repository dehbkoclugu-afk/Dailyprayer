#!/usr/bin/env node
import { EBIBLE_PACK_SOURCES } from './ebible-pack-sources.mjs';
import {
  EBIBLE_SOURCE_IDS,
  GLOBAL_LANGUAGE_CATALOG,
  FULL_BIBLE_RIGHTS_VERIFIED_LOCALE_TAGS,
} from '../src/i18n/globalLanguageCatalog.ts';

const errors = [];
const buildTags = Object.keys(EBIBLE_PACK_SOURCES).sort();
const runtimeTags = Object.keys(EBIBLE_SOURCE_IDS).sort();

if (buildTags.length !== 29) errors.push(`expected 29 buildable eBible pins, found ${buildTags.length}`);
if (runtimeTags.length !== 29) errors.push(`expected 29 runtime eBible pins, found ${runtimeTags.length}`);

for (const tag of buildTags) {
  if (EBIBLE_SOURCE_IDS[tag] !== EBIBLE_PACK_SOURCES[tag].id) {
    errors.push(`${tag}: runtime/build source ID mismatch`);
  }
  const catalog = GLOBAL_LANGUAGE_CATALOG.find((item) => item.tag === tag);
  if (!catalog || catalog.rights !== 'verified-us-public-domain') {
    errors.push(`${tag}: build source is not in verified public-domain inventory set`);
  }
}

const verifiedWithoutSource = FULL_BIBLE_RIGHTS_VERIFIED_LOCALE_TAGS.filter((tag) => !EBIBLE_SOURCE_IDS[tag]);
if (verifiedWithoutSource.join(',') !== 'ru') {
  errors.push(`expected only Russian to lack a verified source ID; got: ${verifiedWithoutSource.join(',') || '(none)'}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('eBible source pins agree: 29 buildable full-Bible pins; Russian intentionally blocked pending source-ID verification');
