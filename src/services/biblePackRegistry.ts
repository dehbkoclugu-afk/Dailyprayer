import {
  RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  type GlobalLocaleTag,
} from '@/i18n/globalLanguageCatalog';
import type { BiblePackRelease } from '@/data/biblePack';
import {
  fetchJson,
  releasesByLocale,
  validateReleaseManifest,
  type ReleaseManifest,
} from '@/services/releaseManifest';

export const LATEST_BIBLE_PACK_MANIFEST_URL =
  'https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/bible-packs-v1/manifest.json';

export type BiblePackManifest = ReleaseManifest<BiblePackRelease>;

const allowedLocales = new Set<string>(RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS);

export async function fetchBiblePackManifest(): Promise<BiblePackManifest> {
  return validateReleaseManifest<BiblePackRelease>(await fetchJson(LATEST_BIBLE_PACK_MANIFEST_URL), {
    label: 'Bible pack',
    allowedLocales,
    expectedCount: RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS.length,
  });
}

export function releaseMap(manifest: BiblePackManifest): Map<GlobalLocaleTag, BiblePackRelease> {
  return releasesByLocale(manifest);
}
