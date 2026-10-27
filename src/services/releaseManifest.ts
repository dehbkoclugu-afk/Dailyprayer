/**
 * Shared validation + fetching for the GitHub-hosted release manifests (Bible
 * packs and application content packs). Pure apart from `fetchJson`, so the
 * rules are unit-tested once for both catalogs.
 */
export interface PackRelease<L extends string = string> {
  locale: L;
  version: string;
  bytes: number;
  sha256: string;
  downloadUrl: string;
}

export interface ReleaseManifest<R extends PackRelease> {
  schemaVersion: 1;
  version: string;
  generatedAt: string;
  releases: R[];
}

export const SHA256_RE = /^[a-f0-9]{64}$/i;
/** Hard ceiling for a single pack download (largest Bible pack is ~6 MB). */
export const MAX_PACK_BYTES = 64 * 1024 * 1024;

export function validateReleaseManifest<R extends PackRelease>(
  value: unknown,
  options: { label: string; allowedLocales: ReadonlySet<string>; expectedCount: number },
): ReleaseManifest<R> {
  const { label, allowedLocales, expectedCount } = options;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} manifest is not an object`);
  }
  const manifest = value as Partial<ReleaseManifest<R>>;
  if (
    manifest.schemaVersion !== 1 ||
    typeof manifest.version !== 'string' ||
    !manifest.version.trim() ||
    typeof manifest.generatedAt !== 'string' ||
    !manifest.generatedAt.trim()
  ) {
    throw new Error(`Invalid ${label} manifest header`);
  }
  if (!Array.isArray(manifest.releases) || manifest.releases.length !== expectedCount) {
    throw new Error(`${label} manifest is incomplete`);
  }

  const seen = new Set<string>();
  for (const release of manifest.releases) {
    if (!release || !allowedLocales.has(release.locale) || seen.has(release.locale)) {
      throw new Error(`Invalid ${label} manifest locale: ${String(release?.locale)}`);
    }
    if (
      typeof release.version !== 'string' ||
      !release.version.trim() ||
      typeof release.bytes !== 'number' ||
      !Number.isFinite(release.bytes) ||
      release.bytes <= 0 ||
      release.bytes > MAX_PACK_BYTES ||
      !SHA256_RE.test(release.sha256) ||
      !/^https:\/\//i.test(release.downloadUrl)
    ) {
      throw new Error(`Invalid ${label} release metadata: ${release.locale}`);
    }
    seen.add(release.locale);
  }
  return manifest as ReleaseManifest<R>;
}

export function releasesByLocale<R extends PackRelease>(manifest: ReleaseManifest<R>): Map<R['locale'], R> {
  return new Map(manifest.releases.map((release) => [release.locale as R['locale'], release]));
}

/** GET JSON with a timeout so a stalled network never leaves a spinner forever. */
export async function fetchJson(url: string, timeoutMs = 15_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
