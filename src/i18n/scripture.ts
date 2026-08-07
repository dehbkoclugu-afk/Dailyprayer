import { useT } from '@/i18n';
import type { Locale } from '@/i18n/translations';
import { useUserStore } from '@/state/useUserStore';

export const BUNDLED_SCRIPTURE_LOCALES = ['en', 'tr', 'es', 'pt', 'fr', 'de'] as const satisfies readonly Locale[];

function isBundledLocale(value: string): value is Locale {
  return (BUNDLED_SCRIPTURE_LOCALES as readonly string[]).includes(value);
}

/**
 * Scripture choice is independent from UI choice.
 * Until a downloaded pack is installed, non-bundled preferences safely fall
 * back to the resolved UI bundle instead of displaying the wrong text.
 */
export function useScriptureLocale(): Locale {
  const uiLocale = useT().locale;
  const preference = useUserStore((state) => state.scriptureLocale);
  if (preference !== 'system' && isBundledLocale(preference)) return preference;
  return uiLocale;
}
