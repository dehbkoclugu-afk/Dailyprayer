import { router } from 'expo-router';

/**
 * Back navigation that also works when a screen was opened directly (deep link,
 * notification) and has no history: it falls back to the Today tab instead of
 * leaving the user stuck.
 */
export function goBack(fallback: '/(tabs)/today' | '/(tabs)/bible' = '/(tabs)/today'): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
