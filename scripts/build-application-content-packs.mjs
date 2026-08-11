import { createHash } from 'node:crypto';
import { readFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

import {
  APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
  DEVOTIONAL_CONTENT_IDS,
  validateApplicationContentPack,
} from '../src/data/applicationContentPack.ts';
import {
  APPLICATION_LOCALES,
  APPLICATION_LOCALE_CANDIDATES,
  PENDING_NATIVE_APPLICATION_LOCALES,
} from '../src/i18n/applicationLocales.ts';

export const BUNDLED_APPLICATION_CONTENT_LOCALES = [
  'en',
  'tr',
  'es',
  'pt',
  'fr',
  'de',
  'it',
  'nl',
];

export const CONTENT_VERSION = '1.0.0';
export const DEVELOPMENT_MANIFEST_NAME = 'manifest.development.json';
export const PRODUCTION_MANIFEST_NAME = 'manifest.json';
const productionLocaleTags = new Set(APPLICATION_LOCALES.map(({ tag }) => tag));
const PRODUCTION_LOCALE_COUNT = APPLICATION_LOCALES.length;
const RELEASE_BASE_URL =
  'https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/application-content-v1';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'content', 'application');
const translationSourceDirectory = path.join(root, 'content', 'application-translations');
const nativeRequire = createRequire(import.meta.url);

async function loadDataModule(relativePath) {
  const filename = path.join(root, relativePath);
  const source = await readFile(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier === '@/i18n/applicationContent') {
      return { getRegisteredApplicationContentPack: () => null };
    }
    if (specifier === '@/i18n') {
      return { useT: () => { throw new Error('Hooks are unavailable during content export'); } };
    }
    if (specifier === '@/data/applicationContentPack') {
      return { DEVOTIONAL_CONTENT_IDS };
    }
    return nativeRequire(specifier);
  };
  const wrapper = vm.runInThisContext(
    `(function (exports, require, module, __filename, __dirname) { ${compiled}\n})`,
    { filename },
  );
  wrapper(module.exports, localRequire, module, filename, path.dirname(filename));
  return module.exports;
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export async function createApplicationContentArtifacts() {
  const [{ getQuizSteps }, { getPrayers }, { getDevotionals }, { getPlans }] =
    await Promise.all([
      loadDataModule('src/data/quiz.ts'),
      loadDataModule('src/data/prayers.ts'),
      loadDataModule('src/data/devotionals.ts'),
      loadDataModule('src/data/plans.ts'),
    ]);

  const packs = new Map();
  for (const locale of BUNDLED_APPLICATION_CONTENT_LOCALES) {
    const pack = validateApplicationContentPack({
      schemaVersion: APPLICATION_CONTENT_PACK_SCHEMA_VERSION,
      locale,
      version: CONTENT_VERSION,
      reviewStatus: 'release-candidate',
      quiz: getQuizSteps(locale).map(({ key, question, subtitle, affirmation, options }) => ({
        key,
        question,
        ...(subtitle ? { subtitle } : {}),
        ...(affirmation ? { affirmation } : {}),
        options: options.map(({ value, label }) => ({ value, label })),
      })),
      prayers: getPrayers(locale).map(({ id, title, script }) => ({ id, title, script })),
      devotionals: getDevotionals(locale).map(({ title, body, prayer }, index) => ({
        id: DEVOTIONAL_CONTENT_IDS[index],
        title,
        body,
        prayer,
      })),
      plans: getPlans(locale).map(({ id, title, tagline }) => ({ id, title, tagline })),
    }, locale);
    packs.set(locale, json(pack));
  }

  const translatedFilenames = await readdir(translationSourceDirectory).catch(() => []);
  for (const filename of translatedFilenames.filter((name) => name.endsWith('.json')).sort()) {
    const sourceText = await readFile(path.join(translationSourceDirectory, filename), 'utf8');
    const pack = validateApplicationContentPack(JSON.parse(sourceText));
    if (BUNDLED_APPLICATION_CONTENT_LOCALES.includes(pack.locale)) {
      throw new Error(`Downloaded-content source duplicates bundled locale: ${pack.locale}`);
    }
    if (filename !== `${pack.locale}.json`) {
      throw new Error(`Application-content source filename/locale mismatch: ${filename}`);
    }
    if (packs.has(pack.locale)) {
      throw new Error(`Duplicate application-content source locale: ${pack.locale}`);
    }
    packs.set(pack.locale, json(pack));
  }

  const releases = [...packs].map(([locale, text]) => ({
    locale,
    version: CONTENT_VERSION,
    bytes: Buffer.byteLength(text, 'utf8'),
    sha256: sha256(text),
    downloadUrl: `${RELEASE_BASE_URL}/${locale}.json`,
  }));
  const productionReleases = releases.filter(({ locale }) => productionLocaleTags.has(locale));
  const globalTargetPendingLocales = APPLICATION_LOCALE_CANDIDATES
    .map(({ tag }) => tag)
    .filter((locale) => !packs.has(locale));
  const manifest = json({
    schemaVersion: 1,
    scope: 'development-partial',
    version: CONTENT_VERSION,
    generatedAt: '2026-08-10T00:00:00.000Z',
    productionRequiredLocaleCount: PRODUCTION_LOCALE_COUNT,
    globalTargetLocaleCount: APPLICATION_LOCALE_CANDIDATES.length,
    globalTargetPendingLocales,
    nativeReviewGatedLocales: PENDING_NATIVE_APPLICATION_LOCALES,
    includedLocales: [...packs.keys()],
    releases,
  });

  const productionManifest = productionReleases.length === PRODUCTION_LOCALE_COUNT
    ? json({
        schemaVersion: 1,
        version: CONTENT_VERSION,
        generatedAt: '2026-08-10T00:00:00.000Z',
        releases: productionReleases,
      })
    : null;

  return { packs, manifest, productionManifest };
}

export async function writeApplicationContentArtifacts() {
  const { packs, manifest, productionManifest } = await createApplicationContentArtifacts();
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    ...[...packs].map(([locale, text]) =>
      writeFile(path.join(outputDirectory, `${locale}.json`), text, 'utf8'),
    ),
    writeFile(path.join(outputDirectory, DEVELOPMENT_MANIFEST_NAME), manifest, 'utf8'),
    ...(productionManifest
      ? [writeFile(path.join(outputDirectory, PRODUCTION_MANIFEST_NAME), productionManifest, 'utf8')]
      : []),
  ]);
  console.log(
    `Wrote ${packs.size}/${PRODUCTION_LOCALE_COUNT} application-content packs (development batch only).`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeApplicationContentArtifacts();
}
