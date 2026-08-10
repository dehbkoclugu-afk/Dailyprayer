import type {
  ApplicationContentLocale,
  ApplicationContentRelease,
} from '../data/applicationContentPack.ts';
import { APPLICATION_LOCALE_CANDIDATES } from '../i18n/applicationLocales.ts';

export const LATEST_APPLICATION_CONTENT_MANIFEST_URL =
  'https://github.com/dehbkoclugu-afk/Dailyprayer/releases/download/application-content-v1/manifest.json';

export interface ApplicationContentManifest {
  schemaVersion: 1;
  version: string;
  generatedAt: string;
  releases: ApplicationContentRelease[];
}

const allowedLocales = new Set<string>(
  APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag),
);
const SHA256_RE = /^[a-f0-9]{64}$/i;

export function validateApplicationContentManifest(value: unknown): ApplicationContentManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Application content manifest is not an object');
  }
  const manifest = value as Partial<ApplicationContentManifest>;
  if (
    manifest.schemaVersion !== 1 ||
    typeof manifest.version !== 'string' ||
    !manifest.version.trim() ||
    typeof manifest.generatedAt !== 'string' ||
    !manifest.generatedAt.trim()
  ) {
    throw new Error('Invalid application content manifest header');
  }
  if (
    !Array.isArray(manifest.releases) ||
    manifest.releases.length !== APPLICATION_LOCALE_CANDIDATES.length
  ) {
    throw new Error('Application content manifest is incomplete');
  }

  const seen = new Set<string>();
  for (const release of manifest.releases) {
    if (
      !release ||
      !allowedLocales.has(release.locale) ||
      seen.has(release.locale)
    ) {
      throw new Error(`Invalid application content manifest locale: ${String(release?.locale)}`);
    }
    if (
      typeof release.version !== 'string' ||
      !release.version.trim() ||
      typeof release.bytes !== 'number' ||
      !Number.isFinite(release.bytes) ||
      release.bytes <= 0 ||
      !SHA256_RE.test(release.sha256) ||
      !/^https:\/\//i.test(release.downloadUrl)
    ) {
      throw new Error(`Invalid application content release metadata: ${release.locale}`);
    }
    seen.add(release.locale);
  }

  return manifest as ApplicationContentManifest;
}

export async function fetchApplicationContentManifest(): Promise<ApplicationContentManifest> {
  const response = await fetch(LATEST_APPLICATION_CONTENT_MANIFEST_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Application content manifest HTTP ${response.status}`);
  }
  return validateApplicationContentManifest(await response.json());
}

export function applicationContentReleaseMap(
  manifest: ApplicationContentManifest,
): Map<ApplicationContentLocale, ApplicationContentRelease> {
  return new Map(manifest.releases.map((release) => [release.locale, release]));
}
