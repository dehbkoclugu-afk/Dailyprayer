import type {
  ApplicationContentLocale,
  ApplicationContentPack,
  ApplicationContentRelease,
} from '../data/applicationContentPack.ts';

export const BUNDLED_APPLICATION_CONTENT_LOCALES = [
  'en',
  'tr',
  'es',
  'pt',
  'fr',
  'de',
  'it',
  'nl',
] as const satisfies readonly ApplicationContentLocale[];

const bundled = new Set<ApplicationContentLocale>(BUNDLED_APPLICATION_CONTENT_LOCALES);

export interface ApplicationLanguageActivationDependencies {
  loadInstalled: (locale: ApplicationContentLocale) => Promise<ApplicationContentPack | null>;
  getRelease: (locale: ApplicationContentLocale) => ApplicationContentRelease | null;
  install: (release: ApplicationContentRelease) => Promise<ApplicationContentPack>;
  register: (pack: ApplicationContentPack) => void;
  setLanguage: (locale: ApplicationContentLocale) => void;
}

/** Persist the locale only after its complete content is available and registered. */
export async function activateApplicationLocale(
  locale: ApplicationContentLocale,
  dependencies: ApplicationLanguageActivationDependencies,
): Promise<void> {
  if (bundled.has(locale)) {
    dependencies.setLanguage(locale);
    return;
  }

  const release = dependencies.getRelease(locale);
  let pack = await dependencies.loadInstalled(locale).catch(() => null);
  if (pack && release && pack.version !== release.version) {
    pack = null;
  }
  if (!pack) {
    if (!release) throw new Error(`Application content release unavailable: ${locale}`);
    pack = await dependencies.install(release);
  }
  if (pack.locale !== locale) {
    throw new Error(`Application content activation locale mismatch: ${pack.locale}`);
  }
  dependencies.register(pack);
  dependencies.setLanguage(locale);
}
