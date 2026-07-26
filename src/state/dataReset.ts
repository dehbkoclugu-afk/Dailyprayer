import { useBibleStore } from '@/state/useBibleStore';
import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useJournalStore } from '@/state/useJournalStore';
import { usePlanStore } from '@/state/usePlanStore';
import { usePrayerStore } from '@/state/usePrayerStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';

/**
 * The one place that decides what "restart" and "delete everything" actually touch
 * (roadmap item 14).
 *
 * Two rules this file exists to enforce:
 *
 * 1. **Restarting onboarding must not take anyone's history with it.** It resets the
 *    name and quiz answers, and nothing else. A streak, a journal and years of
 *    highlights are not onboarding state.
 * 2. **Purchases are never local data.** Plus entitlement lives with the store
 *    (Apple/Google via RevenueCat); deleting local data must not appear to revoke
 *    something the user paid for, so `useEntitlementStore` is deliberately absent
 *    from both lists. Appearance and language are settings, not personal history,
 *    so they survive too.
 *
 * `collectDataSummary` feeds the confirmation screen: the user sees counts for what
 * is about to go, rather than a vague warning.
 */

/** What a full delete erases, and what it leaves alone. Shown to the user. */
export interface DataSummary {
  journalEntries: number;
  highlights: number;
  bookmarks: number;
  savedVerses: number;
  streakDays: number;
  bestStreak: number;
  planProgressDays: number;
  favoritePrayers: number;
  /** Empty when onboarding never captured one. */
  name: string;
  hasQuizAnswers: boolean;
}

export function collectDataSummary(): DataSummary {
  const { quiz } = useUserStore.getState();
  const streak = useStreakStore.getState();
  const plans = usePlanStore.getState();
  const bible = useBibleStore.getState();

  return {
    journalEntries: useJournalStore.getState().entries.length,
    highlights: Object.keys(useHighlightStore.getState().marks).length,
    bookmarks: useBookmarkStore.getState().bookmarks.length,
    savedVerses: bible.savedVerseKeys.length,
    streakDays: streak.count,
    bestStreak: streak.bestCount,
    planProgressDays: Object.values(plans.progress).reduce((n, days) => n + days.length, 0),
    favoritePrayers: usePrayerStore.getState().favoritePrayerIds.length,
    name: quiz.name,
    hasQuizAnswers: Boolean(
      quiz.tradition || quiz.goals.length || quiz.struggles.length || quiz.prayerTime || quiz.experience,
    ),
  };
}

/**
 * Restart onboarding: name and quiz answers only.
 *
 * Everything else is history the user built and must survive. `useUserStore.reset`
 * already scopes itself this way; going through here keeps the guarantee in one
 * place and testable.
 */
export function restartOnboarding(): void {
  useUserStore.getState().reset();
}

/**
 * Erase everything personal on this device: history, progress and content.
 *
 * Keeps Plus entitlement (a purchase, restored from the store), and the appearance
 * and language settings, so the app does not lurch into another language at the
 * moment someone is trying to clean up.
 */
export function deleteAllUserData(): void {
  useJournalStore.getState().reset();
  useHighlightStore.getState().reset();
  useBookmarkStore.getState().reset();
  useStreakStore.getState().reset();
  usePlanStore.getState().reset();
  usePrayerStore.getState().reset();
  useBibleStore.getState().reset();
  useReaderStore.getState().reset();
  useUserStore.getState().reset();
}
