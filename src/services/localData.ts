import AsyncStorage from '@react-native-async-storage/async-storage';
import { selectLocalUserDataKeys } from '@/lib/localDataKeys';
import { disableReminders } from '@/services/notifications';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useJournalStore } from '@/state/useJournalStore';
import { usePlanStore } from '@/state/usePlanStore';
import { usePrayerStore } from '@/state/usePrayerStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useToastStore } from '@/state/useToastStore';
import { useUserStore } from '@/state/useUserStore';

/**
 * Personal stores wiped by "Delete local data". The entitlement cache is kept on
 * purpose: it mirrors the store account, not anything the user wrote.
 */
const USER_DATA_STORES = [
  useUserStore,
  useStreakStore,
  useJournalStore,
  usePrayerStore,
  useBookmarkStore,
  useHighlightStore,
  usePlanStore,
  useReaderStore,
  useReaderPrefsStore,
] as const;

export async function clearLocalUserData(): Promise<void> {
  await disableReminders();
  // Reset memory from each store's own initial state (no hand-copied defaults
  // to drift), then remove the persisted copies that the reset just rewrote.
  for (const store of USER_DATA_STORES) {
    (store.setState as (state: unknown, replace: true) => void)(store.getInitialState(), true);
  }
  await Promise.all(USER_DATA_STORES.map((store) => store.persist.clearStorage()));
  const keys = selectLocalUserDataKeys(await AsyncStorage.getAllKeys());
  if (keys.length) await AsyncStorage.multiRemove(keys);
  useToastStore.getState().clear();
}

/** Everything the user created, as portable JSON (journal, marks, plans, settings). */
export function exportLocalUserData(): string {
  const { quiz, themePreference, language, scriptureLocale } = useUserStore.getState();
  const streak = useStreakStore.getState();
  return JSON.stringify(
    {
      app: 'Selaora',
      schema: 1,
      exportedAt: new Date().toISOString(),
      profile: { name: quiz.name, themePreference, language, scriptureLocale, reminder: quiz.prayerTime },
      streak: { count: streak.count, bestCount: streak.bestCount, totalDays: streak.totalDays },
      journal: useJournalStore.getState().entries,
      bookmarks: useBookmarkStore.getState().bookmarks,
      highlights: useHighlightStore.getState().marks,
      plans: usePlanStore.getState().progress,
      favoritePrayers: usePrayerStore.getState().favoritePrayerIds,
    },
    null,
    2,
  );
}
