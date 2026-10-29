import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safePersistStorage } from '@/state/safePersistStorage';
import {
  isCachedEntitlementValid,
  type EntitlementSnapshot,
} from '@/services/purchases.logic';

interface EntitlementState {
  /** true when the `plus` entitlement is active (RevenueCat) or dev override */
  isPlus: boolean;
  /** ISO expiry of the cached entitlement; null for lifetime/inactive */
  expiresAt: string | null;
  /** last time RevenueCat confirmed the entitlement (ms epoch) */
  verifiedAt: number | null;
  setEntitlement: (snapshot: EntitlementSnapshot) => void;
  /** Drop a cached entitlement whose known expiry has passed (offline launches). */
  expireIfLapsed: () => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => ({
      isPlus: false,
      expiresAt: null,
      verifiedAt: null,
      setEntitlement: ({ active, expiresAt }) =>
        set({ isPlus: active, expiresAt: active ? expiresAt : null, verifiedAt: Date.now() }),
      expireIfLapsed: () => {
        const { isPlus, expiresAt } = get();
        if (isPlus && !isCachedEntitlementValid({ active: isPlus, expiresAt })) {
          set({ isPlus: false, expiresAt: null });
        }
      },
    }),
    {
      name: 'lumen-entitlement',
      version: 1,
      storage: createJSONStorage(() => safePersistStorage),
      partialize: ({ isPlus, expiresAt, verifiedAt }) => ({ isPlus, expiresAt, verifiedAt }),
      // v0 stored an unused `sawDiscountOffer` flag next to isPlus.
      migrate: (persisted) => {
        const value = (persisted ?? {}) as { isPlus?: unknown };
        return { isPlus: value.isPlus === true, expiresAt: null, verifiedAt: null };
      },
    },
  ),
);
