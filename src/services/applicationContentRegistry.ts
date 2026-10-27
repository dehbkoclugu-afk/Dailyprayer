import type {
  ApplicationContentLocale,
  ApplicationContentRelease,
} from '../data/applicationContentPack.ts';
import { APPLICATION_LOCALES } from '../i18n/applicationLocales.ts';
import {
  fetchJson,
  releasesByLocale,
  validateReleaseManifest,
  type ReleaseManifest,
} from './releaseManifest.ts';

export const LATEST_APPLICATION_CONTENT_MANIFEST_URL =
  'https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/application-content-v1/manifest.json';

export type ApplicationContentManifest = ReleaseManifest<ApplicationContentRelease>;

const allowedLocales = new Set<string>(APPLICATION_LOCALES.map((locale) => locale.tag));

export function validateApplicationContentManifest(value: unknown): ApplicationContentManifest {
  return validateReleaseManifest<ApplicationContentRelease>(value, {
    label: 'Application content',
    allowedLocales,
    expectedCount: APPLICATION_LOCALES.length,
  });
}

export async function fetchApplicationContentManifest(): Promise<ApplicationContentManifest> {
  return validateApplicationContentManifest(await fetchJson(LATEST_APPLICATION_CONTENT_MANIFEST_URL));
}

export function applicationContentReleaseMap(
  manifest: ApplicationContentManifest,
): Map<ApplicationContentLocale, ApplicationContentRelease> {
  return releasesByLocale(manifest);
}
