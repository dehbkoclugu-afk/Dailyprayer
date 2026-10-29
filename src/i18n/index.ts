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

export type TranslationParams = Record<string, string | number>;

/**
 * Replace `{{name}}` tokens; numbers use the locale's digits (e.g. Persian).
 * Unknown tokens are left visible for QA.
 */
export function interpolate(template: string, params?: TranslationParams, locale?: string): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return match;
    const value = params[name];
    if (typeof value === 'number' && locale) {
      try {
        return new Intl.NumberFormat(locale).format(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  });
}

function lookup(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  const dict = translations[locale] as Record<string, string>;
  return interpolate(dict[key] ?? translations.en[key], params, locale);
}

/** Reactive translator for components. */
export function useT() {
  const pref = useUserStore((s) => s.language);
  const locale = resolveLocale(pref);
  return {
    locale,
    t: (key: TranslationKey, params?: TranslationParams) => lookup(locale, key, params),
  };
}

/** Non-reactive translator for call sites outside React (toasts, services). */
export function translate(key: TranslationKey, params?: TranslationParams): string {
  return lookup(resolveLocale(useUserStore.getState().language), key, params);
}
