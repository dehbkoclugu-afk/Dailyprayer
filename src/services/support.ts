import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CONTACT_EMAIL } from '@/data/legal';

/**
 * Reaching a human.
 *
 * One address, resolved in one place. `EXPO_PUBLIC_SUPPORT_EMAIL` lets a release
 * point support somewhere other than the address published in the policies; when
 * it is unset or malformed we fall back to `CONTACT_EMAIL` rather than leaving the
 * contact row dead, because the policies already promise that address works.
 */
const configured = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? '';
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const SUPPORT_EMAIL = looksLikeEmail(configured) ? configured : CONTACT_EMAIL;

/** True when the release is pointing support at its own address, not the fallback. */
export const SUPPORT_EMAIL_IS_CONFIGURED = looksLikeEmail(configured);

export function buildMailtoUrl(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body) params.set('body', body);
  // URLSearchParams encodes spaces as "+", which some mail clients show literally.
  return `mailto:${SUPPORT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}

export type SupportOutcome = 'opened' | 'copied' | 'failed';

/**
 * Open the user's mail app, or fall back to putting the address on the clipboard.
 *
 * A device with no mail client is common — the row must still give the address
 * rather than silently doing nothing (roadmap item 18). The caller is told which
 * happened so it can say so.
 */
export async function contactSupport(subject: string, body?: string): Promise<SupportOutcome> {
  const url = buildMailtoUrl(subject, body);
  try {
    // canOpenURL is the honest check; openURL alone rejects only on some platforms.
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return 'opened';
    }
  } catch {
    // fall through to the clipboard
  }
  try {
    await Clipboard.setStringAsync(SUPPORT_EMAIL);
    return 'copied';
  } catch {
    return 'failed';
  }
}
