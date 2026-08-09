import { getLocales } from 'expo-localization';
import { translations, type Locale, type TranslationKey } from './translations';
import { resolveApplicationLocale } from './applicationLocales.ts';
import { useUserStore } from '@/state/useUserStore';

export {
  APPLICATION_LOCALES,
  RTL_APPLICATION_LOCALES,
  SUPPORTED_LOCALES,
  getApplicationLocale,
  resolveApplicationLocale,
} from './applicationLocales.ts';

export function resolveLocale(pref: Locale | 'system'): Locale {
  if (pref !== 'system') return pref;
  try {
    const device = getLocales()[0];
    return resolveApplicationLocale(device?.languageTag, device?.languageCode);
  } catch {
    return 'en';
  }
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
