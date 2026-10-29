import { useBookmarkStore } from '@/state/useBookmarkStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useJournalStore } from '@/state/useJournalStore';
import { usePlanStore } from '@/state/usePlanStore';
import { usePrayerStore } from '@/state/usePrayerStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useReaderStore } from '@/state/useReaderStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';

interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
}

/** Every AsyncStorage-backed store; startup logic must not run before these load. */
export const PERSISTED_STORES: readonly PersistedStore[] = [
  useUserStore,
  useStreakStore,
  useEntitlementStore,
  useJournalStore,
  usePrayerStore,
  useBookmarkStore,
  useHighlightStore,
  usePlanStore,
  useReaderStore,
  useReaderPrefsStore,
];

/** Resolves once every persisted store has finished reading AsyncStorage. */
export function waitForHydration(stores: readonly PersistedStore[] = PERSISTED_STORES): Promise<void> {
  return Promise.all(
    stores.map(
      (store) =>
        new Promise<void>((resolve) => {
          if (store.persist.hasHydrated()) {
            resolve();
            return;
          }
          const unsubscribe = store.persist.onFinishHydration(() => {
            unsubscribe();
            resolve();
          });
        }),
    ),
  ).then(() => {});
}
