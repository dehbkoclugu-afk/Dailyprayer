import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import type { BiblePack } from '@/data/biblePack';

export interface ScriptureSource {
  edition: string;
  rights?: string;
  credit: string;
  sourceUrl: string;
  licenseUrl?: string;
}

export const BUNDLED_SCRIPTURE_SOURCES = {
  en: {
    edition: 'World English Bible',
    rights: 'Public domain. “World English Bible” is an eBible.org trademark and identifies unchanged text.',
    sourceUrl: 'https://ebible.org/eng-web/copyright.htm',
  },
  tr: {
    edition: 'Yorumsuz Türkçe Çeviri (YTC)',
    rights: 'CC BY-ND 4.0 · © 2023–2025 İsmail Serinken and eBible.org',
    sourceUrl: 'https://ebible.org/turytc/copyright.htm',
    licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
  },
  es: {
    edition: 'Reina-Valera 1909',
    rights: 'Public domain (upstream source claim).',
    sourceUrl: 'https://github.com/seven1m/open-bibles/blob/master/spa-rv1909.usfx.xml',
  },
  de: {
    edition: 'Lutherbibel 1912',
    rights: 'Public domain.',
    sourceUrl: 'https://ebible.org/Scriptures/copyright.php',
  },
} as const;

export type BundledScriptureLocale = keyof typeof BUNDLED_SCRIPTURE_SOURCES;

export function bundledScriptureSource(
  locale: BundledScriptureLocale,
  credit: string,
): ScriptureSource {
  return { ...BUNDLED_SCRIPTURE_SOURCES[locale], credit };
}

export function downloadedScriptureSource(pack: BiblePack): ScriptureSource {
  return {
    edition: pack.edition,
    credit: pack.credit,
    sourceUrl: pack.sourceUrl,
  };
}

export function isHttpsScriptureUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveScriptureSource(
  locale: GlobalLocaleTag,
  bundledCredit: string,
  downloaded?: BiblePack,
): ScriptureSource {
  if (downloaded) return downloadedScriptureSource(downloaded);
  const bundledLocale = locale in BUNDLED_SCRIPTURE_SOURCES
    ? locale as BundledScriptureLocale
    : 'en';
  return bundledScriptureSource(bundledLocale, bundledCredit);
}
