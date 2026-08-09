import type { Locale } from '@/i18n/translations';

/**
 * Locale-aware uppercasing (roadmap item 33). `textTransform: 'uppercase'`
 * renders through the platform's *locale-insensitive* uppercase mapping —
 * iOS's `-uppercaseString` is documented as not localized, and Android's is
 * tied to the device's system locale rather than this app's own language
 * setting, so a Turkish-speaking user running an English phone got it wrong
 * either way. Turkish's one relevant exception: lowercase dotted `i` capitalises
 * to `İ` (dotted), not the plain ASCII `I` every other supported language uses.
 * `String.prototype.toLocaleUpperCase` handles it correctly — confirmed:
 * `'nisan'.toLocaleUpperCase('tr')` → `'NİSAN'`, where `.toUpperCase()` gives the
 * wrong `'NISAN'`. The concrete bug this was causing: Today's date line shows
 * the month name in caps, and every April it read wrong.
 *
 * Applying this to text that is *already* run through `textTransform:
 * 'uppercase'` in its style is harmless — uppercasing an already-correctly-cased
 * Turkish `İ` is a no-op — so call sites do not need to also remove that style.
 *
 * Kept in its own module, with no `@/state` or native-module imports, so it can
 * be exercised by the plain Node test runner the way the app's other pure logic
 * (`src/data/planReadings.logic.ts`) is — `src/i18n/index.ts` pulls in
 * `expo-localization` and the Zustand user store, neither of which resolve
 * outside the app bundler.
 */
export function localeUpper(text: string, locale: Locale): string {
  return text.toLocaleUpperCase(locale);
}
