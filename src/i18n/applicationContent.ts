import {
  validateApplicationContentPack,
  type ApplicationContentLocale,
  type ApplicationContentPack,
} from '../data/applicationContentPack.ts';

const registered = new Map<ApplicationContentLocale, ApplicationContentPack>();

/** Register only a complete pack; callers activate the locale after this succeeds. */
export function registerApplicationContentPack(value: unknown): ApplicationContentPack {
  const pack = validateApplicationContentPack(value);
  registered.set(pack.locale, pack);
  return pack;
}

export function getRegisteredApplicationContentPack(
  locale: ApplicationContentLocale,
): ApplicationContentPack | null {
  return registered.get(locale) ?? null;
}

/** Test/recovery boundary; production normally replaces a locale by registering a newer pack. */
export function clearRegisteredApplicationContentPacks(): void {
  registered.clear();
}
