#!/usr/bin/env node
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { EBIBLE_PACK_SOURCES } from './ebible-pack-sources.mjs';
import { CROSSWIRE_PD_FALLBACKS } from './crosswire-pack-sources.mjs';

const OPEN_BIBLES_RELEASE_LOCALES = ['ru', 'mi'];
const eBibleLocales = Object.keys(EBIBLE_PACK_SOURCES).filter((locale) => locale !== 'ko');
const crossWireLocales = Object.keys(CROSSWIRE_PD_FALLBACKS);
const releaseLocales = [...eBibleLocales, ...crossWireLocales, ...OPEN_BIBLES_RELEASE_LOCALES];

if (new Set(releaseLocales).size !== releaseLocales.length) throw new Error('Duplicate locale in release source map');
if (releaseLocales.length !== 40) throw new Error(`Expected 40 release locales, found ${releaseLocales.length}`);

function run(script, locale) {
  const result = spawnSync(process.execPath, [script, locale], { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${script} failed for ${locale}`);
}

for (const locale of eBibleLocales) run('scripts/build-ebible-pack.mjs', locale);
for (const locale of crossWireLocales) run('scripts/build-crosswire-pack.mjs', locale);
for (const locale of OPEN_BIBLES_RELEASE_LOCALES) run('scripts/build-openbibles-pack.mjs', locale);

const version = process.env.BIBLE_PACK_RELEASE_VERSION || 'dev';
const baseUrl = (process.env.BIBLE_PACK_BASE_URL ||
  `https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/${encodeURIComponent(version)}`
).replace(/\/$/, '');

const releases = releaseLocales.map((locale) => {
  const file = join('dist', 'bible-packs', `${locale}.json`);
  const shaFile = `${file}.sha256`;
  const sha256 = readFileSync(shaFile, 'utf8').trim().split(/\s+/)[0];
  if (!/^[a-f0-9]{64}$/i.test(sha256)) throw new Error(`Invalid release hash for ${locale}`);
  return {
    locale,
    version,
    bytes: statSync(file).size,
    sha256,
    downloadUrl: `${baseUrl}/${locale}.json`,
  };
});

const manifest = {
  schemaVersion: 1,
  version,
  generatedAt: new Date().toISOString(),
  releases,
};
writeFileSync('dist/bible-packs/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`release manifest: ${releases.length} locales · ${version}`);
