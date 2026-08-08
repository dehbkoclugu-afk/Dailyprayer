import {
  RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  type GlobalLocaleTag,
} from '@/i18n/globalLanguageCatalog';
import type { BiblePackRelease } from '@/data/biblePack';

export const LATEST_BIBLE_PACK_MANIFEST_URL =
  'https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/bible-packs-v1/manifest.json';

export interface BiblePackManifest {
  schemaVersion: 1;
  version: string;
  generatedAt: string;
  releases: BiblePackRelease[];
}

const allowed = new Set<string>(RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS);
const SHA256_RE = /^[a-f0-9]{64}$/i;

export async function fetchBiblePackManifest(): Promise<BiblePackManifest> {
  const response = await fetch(LATEST_BIBLE_PACK_MANIFEST_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Bible pack manifest HTTP ${response.status}`);

  const value = await response.json() as Partial<BiblePackManifest>;
  if (value.schemaVersion !== 1 || typeof value.version !== 'string' || !value.version) {
    throw new Error('Invalid Bible pack manifest header');
  }
  if (!Array.isArray(value.releases) || value.releases.length !== RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS.length) {
    throw new Error('Bible pack manifest is incomplete');
  }

  const seen = new Set<string>();
  for (const release of value.releases) {
    if (!release || !allowed.has(release.locale) || seen.has(release.locale)) {
      throw new Error(`Invalid Bible pack manifest locale: ${String(release?.locale)}`);
    }
    if (
      typeof release.version !== 'string' || !release.version ||
      typeof release.bytes !== 'number' || release.bytes <= 0 ||
      !SHA256_RE.test(release.sha256) ||
      !/^https:\/\//i.test(release.downloadUrl)
    ) {
      throw new Error(`Invalid Bible pack release metadata: ${release.locale}`);
    }
    seen.add(release.locale);
  }
  return value as BiblePackManifest;
}

export function releaseMap(manifest: BiblePackManifest): Map<GlobalLocaleTag, BiblePackRelease> {
  return new Map(manifest.releases.map((release) => [release.locale, release]));
}
