import assert from 'node:assert/strict';
import test from 'node:test';
import { APPLICATION_LOCALES } from '../i18n/applicationLocales.ts';
import {
  applicationContentReleaseMap,
  validateApplicationContentManifest,
  type ApplicationContentManifest,
} from './applicationContentRegistry.ts';

function validManifest(): ApplicationContentManifest {
  return {
    schemaVersion: 1,
    version: '1.0.0',
    generatedAt: '2026-08-10T00:00:00.000Z',
    releases: APPLICATION_LOCALES.map(({ tag }) => ({
      locale: tag as ApplicationContentManifest['releases'][number]['locale'],
      version: '1.0.0',
      bytes: 1024,
      sha256: 'a'.repeat(64),
      downloadUrl: `https://github.com/example/releases/download/v1/${tag}.json`,
    })),
  };
}

test('accepts an exact 38-locale application content manifest', () => {
  const manifest = validateApplicationContentManifest(validManifest());
  assert.equal(manifest.releases.length, 38);
  assert.equal(applicationContentReleaseMap(manifest).size, 38);
});

test('rejects missing, duplicate, and unexpected manifest locales', () => {
  const missing = validManifest();
  missing.releases.pop();
  assert.throws(() => validateApplicationContentManifest(missing), /incomplete/);

  const duplicate = validManifest();
  duplicate.releases[1]!.locale = duplicate.releases[0]!.locale;
  assert.throws(() => validateApplicationContentManifest(duplicate), /locale/);

  const unexpected = validManifest();
  unexpected.releases[0]!.locale = 'bg' as ApplicationContentManifest['releases'][number]['locale'];
  assert.throws(() => validateApplicationContentManifest(unexpected), /locale/);
});

test('rejects invalid release integrity metadata', () => {
  const checksum = validManifest();
  checksum.releases[0]!.sha256 = 'bad';
  assert.throws(() => validateApplicationContentManifest(checksum), /metadata/);

  const insecure = validManifest();
  insecure.releases[0]!.downloadUrl = 'http://example.com/ar.json';
  assert.throws(() => validateApplicationContentManifest(insecure), /metadata/);

  const emptyVersion = validManifest();
  emptyVersion.releases[0]!.version = '';
  assert.throws(() => validateApplicationContentManifest(emptyVersion), /metadata/);
});
