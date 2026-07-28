import type { Locale } from './translations';

/**
 * Uppercase a string the way its language does it (roadmap item 33).
 *
 * The eyebrows, badges and section labels were uppercased with React Native's
 * `textTransform: 'uppercase'`, which applies the Unicode default case mapping
 * with no idea what language it is looking at. Turkish is the one language of the
 * six where that is wrong, and it is wrong often: dotted `i` uppercases to `İ`,
 * not `I`. "Günün ayeti" became "GÜNÜN AYETI", "Ayet işlemleri" became "AYET
 * IŞLEMLERI", and the Bible tab's own label — "İncil" — rendered "İNCIL", with
 * the dot on the wrong letter.
 *
 * Six of sixteen sampled Turkish strings were mangled, and the ones that survived
 * did so by not containing an `i`.
 *
 * The `i` → `İ` pass runs before `toLocaleUpperCase` rather than relying on it.
 * Node honours the locale tag, but the app runs on Hermes, and a case mapping
 * that silently ignores its argument would put the bug straight back with nothing
 * to show for it. Doing the one substitution the language needs first makes the
 * result correct either way; `ı` → `I` is already the default mapping.
 *
 * This is applied at render rather than by shipping pre-uppercased translations,
 * because half of what gets uppercased is not a translation at all — the date on
 * Today, a verse reference, a chapter number, a book name out of the Scripture
 * data. Those have no translation entry to pre-case, and they are exactly the
 * strings full of Turkish `i`s.
 */
export function upper(text: string, locale: Locale): string {
  if (locale === 'tr') return text.replace(/i/g, 'İ').toLocaleUpperCase('tr');
  return text.toLocaleUpperCase(locale);
}
