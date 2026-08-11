import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateApplicationContentPack } from '../src/data/applicationContentPack.ts';
import {
  APPLICATION_LOCALES,
  APPLICATION_LOCALE_CANDIDATES,
  PENDING_NATIVE_APPLICATION_LOCALES,
} from '../src/i18n/applicationLocales.ts';
import {
  DEVELOPMENT_MANIFEST_NAME,
  PRODUCTION_MANIFEST_NAME,
  createApplicationContentArtifacts,
} from './build-application-content-packs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(root, 'content', 'application');
const production = process.argv.includes('--production');
const forbiddenFields = new Set(['verseText', 'scriptureText', 'chapters', 'books']);

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function assertNoForbiddenFields(value, location = 'pack') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoForbiddenFields(child, `${location}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenFields.has(key)) {
      throw new Error(`${location} contains forbidden Scripture field: ${key}`);
    }
    assertNoForbiddenFields(child, `${location}.${key}`);
  }
}

function assertNoUnresolvedMarkers(value, location = 'pack') {
  if (typeof value === 'string' && /\{\{[^}]+\}\}|\$\{[^}]+\}/.test(value)) {
    throw new Error(`${location} contains an unresolved interpolation marker`);
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assertNoUnresolvedMarkers(child, `${location}.${key}`);
  }
}

async function main() {
  const expected = await createApplicationContentArtifacts();
  const names = await readdir(contentDirectory);
  const artifactLocales = names
    .filter((name) => name.endsWith('.json') && !name.startsWith('manifest.'))
    .map((name) => name.slice(0, -5))
    .sort();
  const completed = [...expected.packs.keys()].sort();
  if (JSON.stringify(artifactLocales) !== JSON.stringify(completed)) {
    throw new Error(`Expected only completed development locales: ${completed.join(', ')}`);
  }

  const releases = [];
  for (const locale of expected.packs.keys()) {
    const filename = path.join(contentDirectory, `${locale}.json`);
    const text = await readFile(filename, 'utf8');
    if (text !== expected.packs.get(locale)) {
      throw new Error(`${locale}.json is stale; run npm run application-content:build`);
    }
    const value = JSON.parse(text);
    validateApplicationContentPack(value, locale);
    assertNoForbiddenFields(value, locale);
    assertNoUnresolvedMarkers(value, locale);
    releases.push({ locale, bytes: Buffer.byteLength(text, 'utf8'), sha256: sha256(text) });
  }

  const manifestText = await readFile(
    path.join(contentDirectory, DEVELOPMENT_MANIFEST_NAME),
    'utf8',
  );
  if (manifestText !== expected.manifest) {
    throw new Error(`${DEVELOPMENT_MANIFEST_NAME} is stale; rebuild the artifacts`);
  }
  const manifest = JSON.parse(manifestText);
  if (
    manifest.scope !== 'development-partial' ||
    manifest.productionRequiredLocaleCount !== APPLICATION_LOCALES.length ||
    manifest.globalTargetLocaleCount !== APPLICATION_LOCALE_CANDIDATES.length ||
    JSON.stringify(manifest.nativeReviewGatedLocales) !==
      JSON.stringify(PENDING_NATIVE_APPLICATION_LOCALES) ||
    manifest.releases.length !== expected.packs.size
  ) {
    throw new Error('Development manifest scope or coverage is invalid');
  }
  for (const release of releases) {
    const entry = manifest.releases.find((candidate) => candidate.locale === release.locale);
    if (!entry || entry.bytes !== release.bytes || entry.sha256 !== release.sha256) {
      throw new Error(`Development manifest metadata mismatch for ${release.locale}`);
    }
  }

  const missing = APPLICATION_LOCALES
    .map((locale) => locale.tag)
    .filter((locale) => !expected.packs.has(locale));
  const globalTargetPending = APPLICATION_LOCALE_CANDIDATES
    .map((locale) => locale.tag)
    .filter((locale) => !expected.packs.has(locale));
  if (JSON.stringify(manifest.globalTargetPendingLocales) !== JSON.stringify(globalTargetPending)) {
    throw new Error('Development manifest global-target report is invalid');
  }
  if (production && missing.length) {
    throw new Error(
      `Production release blocked: ${missing.length} application-content locales are missing: ${missing.join(', ')}`,
    );
  }
  if (production) {
    const productionManifestText = await readFile(
      path.join(contentDirectory, PRODUCTION_MANIFEST_NAME),
      'utf8',
    );
    if (productionManifestText !== expected.productionManifest) {
      throw new Error(`${PRODUCTION_MANIFEST_NAME} is stale; rebuild the artifacts`);
    }
    console.log(
      `Verified ${APPLICATION_LOCALES.length}/${APPLICATION_LOCALES.length} production application-content packs. ` +
        `Global target remains pending: ${globalTargetPending.join(', ') || 'none'}.`,
    );
    return;
  }
  console.log(
    `Verified ${releases.length}/${APPLICATION_LOCALE_CANDIDATES.length} completed global-target packs. ` +
      (missing.length
        ? `Production release is NOT ready (${missing.length} advertised locales missing: ${missing.join(', ')}). `
        : `Production coverage is complete for all ${APPLICATION_LOCALES.length} advertised locales. `) +
      `Global target remains pending: ${globalTargetPending.join(', ') || 'none'}.`,
  );
}

await main();
