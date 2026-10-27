import { useEffect } from 'react';
import { router } from 'expo-router';
import { useEntitlementStore } from '@/state/useEntitlementStore';

/**
 * Guard for Plus-only screens. Lists already route locked items to the paywall,
 * but deep links (selaora/lumen://player?id=…) can open a screen directly —
 * this sends those visits to the paywall too. Returns whether access is allowed.
 */
export function useRequirePlus(required: boolean, from: 'prayer' | 'plan' | 'sleep'): boolean {
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const allowed = !required || isPlus;
  useEffect(() => {
    if (!allowed) router.replace(`/paywall?from=${from}`);
  }, [allowed, from]);
  return allowed;
}
