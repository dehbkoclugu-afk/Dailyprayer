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
  /** ISO expiry; null only for a verified lifetime entitlement or inactive state. */
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
      version: 2,
      storage: createJSONStorage(() => safePersistStorage),
      partialize: ({ isPlus, expiresAt, verifiedAt }) => ({ isPlus, expiresAt, verifiedAt }),
      // v0 stored an unused `sawDiscountOffer` flag next to isPlus.
      migrate: (persisted, version) => {
        const value = (persisted ?? {}) as { isPlus?: unknown; expiresAt?: unknown; verifiedAt?: unknown };
        // v0 had no expiry or verification timestamp. Never turn that unknown
        // subscription into a lifetime entitlement while offline.
        if (version === 0) return { isPlus: false, expiresAt: null, verifiedAt: null };
        return {
          isPlus: value.isPlus === true && (typeof value.expiresAt === 'string' || typeof value.verifiedAt === 'number'),
          expiresAt: typeof value.expiresAt === 'string' ? value.expiresAt : null,
          verifiedAt: typeof value.verifiedAt === 'number' ? value.verifiedAt : null,
        };
      },
    },
  ),
);
