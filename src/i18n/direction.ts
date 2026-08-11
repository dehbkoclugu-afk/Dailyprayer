import {
  APPLICATION_LOCALE_CANDIDATES,
  type AppDirection,
} from './applicationLocales.ts';

export type DirectionalIoniconName =
  | 'chevron-back'
  | 'chevron-forward'
  | 'arrow-back'
  | 'arrow-forward'
  | 'play-skip-back'
  | 'play-skip-forward';

const RTL_ICON_NAME: Partial<Record<DirectionalIoniconName, DirectionalIoniconName>> = {
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
};

/** Unknown or retired stored locales safely recover to English direction. */
export function getApplicationDirection(locale: string): AppDirection {
  return APPLICATION_LOCALE_CANDIDATES.find((candidate) => candidate.tag === locale)?.direction ?? 'ltr';
}

export function isApplicationRTL(locale: string): boolean {
  return getApplicationDirection(locale) === 'rtl';
}

/** Playback icons are deliberately absent from RTL_ICON_NAME and never mirror. */
export function getDirectionalIconName(
  icon: DirectionalIoniconName,
  locale: string,
): DirectionalIoniconName {
  return isApplicationRTL(locale) ? RTL_ICON_NAME[icon] ?? icon : icon;
}
