import { useT } from '@/i18n';
import type { Locale } from '@/i18n/translations';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { useUserStore } from '@/state/useUserStore';

export const BUNDLED_SCRIPTURE_LOCALES = ['en', 'tr', 'es', 'pt', 'fr', 'de'] as const satisfies readonly Locale[];

export function isBundledScriptureLocale(value: string): value is Locale {
  return (BUNDLED_SCRIPTURE_LOCALES as readonly string[]).includes(value);
}

/** Scripture choice is independent from UI choice; system follows the resolved UI locale. */
export function useScriptureLocale(): GlobalLocaleTag {
  const uiLocale = useT().locale;
  const preference = useUserStore((state) => state.scriptureLocale);
  return preference === 'system' ? uiLocale : preference;
}
