import { getLocales } from 'expo-localization';
import { translations, type Locale, type TranslationKey } from './translations';
import { resolveApplicationLocale } from './applicationLocales.ts';
import { getRegisteredApplicationContentPack } from './applicationContent';
import { BUNDLED_APPLICATION_CONTENT_LOCALES } from './applicationLanguageActivation';
import { useUserStore } from '@/state/useUserStore';

export {
  APPLICATION_LOCALES,
  APPLICATION_LOCALE_TAGS,
  PENDING_NATIVE_APPLICATION_LOCALES,
  RTL_APPLICATION_LOCALES,
  SUPPORTED_LOCALES,
  getApplicationLocale,
  resolveApplicationLocale,
} from './applicationLocales.ts';

export function resolveRequestedApplicationLocale(pref: Locale | 'system'): Locale {
  if (pref !== 'system') return resolveApplicationLocale(pref, pref);
  try {
    const device = getLocales()[0];
    return resolveApplicationLocale(device?.languageTag, device?.languageCode);
  } catch {
    return 'en';
  }
}

const bundledApplicationContent = new Set<string>(BUNDLED_APPLICATION_CONTENT_LOCALES);

/** Resolve only to locales whose complete long-form content is available now. */
export function resolveLocale(pref: Locale | 'system'): Locale {
  const requested = resolveRequestedApplicationLocale(pref);
  if (
    bundledApplicationContent.has(requested) ||
    getRegisteredApplicationContentPack(requested)
  ) {
    return requested;
  }
  return 'en';
}

function lookup(locale: Locale, key: TranslationKey): string {
  const dict = translations[locale] as Record<string, string>;
  return dict[key] ?? translations.en[key];
}

/** Reactive translator for components. */
export function useT() {
  const pref = useUserStore((s) => s.language);
  const locale = resolveLocale(pref);
  return {
    locale,
    t: (key: TranslationKey) => lookup(locale, key),
  };
}

/** Non-reactive translator for call sites outside React (toasts, services). */
export function translate(key: TranslationKey): string {
  return lookup(resolveLocale(useUserStore.getState().language), key);
}
