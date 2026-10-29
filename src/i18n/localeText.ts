/** Locale-aware casing keeps dotted/dotless letters correct (for example tr: i → İ). */
export function localeUpperCase(value: string, locale: string): string {
  try {
    return value.toLocaleUpperCase(locale);
  } catch {
    return value.toUpperCase();
  }
}
