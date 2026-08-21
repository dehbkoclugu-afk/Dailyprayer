import AsyncStorage from '@react-native-async-storage/async-storage';
import { selectLocalUserDataKeys } from '@/lib/localDataKeys';
import { disableReminders } from '@/services/notifications';
import { useBibleStore } from '@/state/useBibleStore';
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
import { useEntitlementStore } from '@/state/useEntitlementStore';

export async function clearLocalUserData(): Promise<void> {
  const keys = selectLocalUserDataKeys(await AsyncStorage.getAllKeys());
  if (keys.length) await AsyncStorage.multiRemove(keys);
  await disableReminders();

  useUserStore.setState({
    onboarded: false,
    themePreference: 'system',
    language: 'system',
    scriptureLocale: 'system',
    quiz: {
      name: '',
      tradition: null,
      goals: [],
      struggles: [],
      prayerTime: null,
      experience: null,
    },
  });
  useStreakStore.setState({ count: 0, lastTickDay: null, bestCount: 0, totalDays: 0, activeDays: [], doneDay: null, doneSteps: [] });
  useJournalStore.setState({ entries: [] });
  usePrayerStore.setState({ recentPrayerId: null, favoritePrayerIds: [] });
  useBookmarkStore.setState({ bookmarks: [] });
  useHighlightStore.setState({ marks: {} });
  usePlanStore.setState({ progress: {} });
  useReaderStore.setState({ book: 0, chapter: 0, verse: 0 });
  useReaderPrefsStore.setState({ fontScale: 1, paper: false, showGestureHint: true });
  // Purchase access is server-owned, but local offers and development overrides
  // must not survive a full local-data reset. RevenueCat restores real access.
  useEntitlementStore.setState({ isPlus: false, sawDiscountOffer: false });
  useBibleStore.setState({ chapterIndex: 0, savedVerseKeys: [], planProgress: {} });
  useToastStore.getState().clear();
}
