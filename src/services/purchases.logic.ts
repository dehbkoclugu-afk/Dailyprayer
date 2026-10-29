export type PlanId = 'monthly' | 'annual' | 'lifetime';
export type PurchaseFailure = 'cancelled' | 'pending' | 'failed';

const CANCELLED = '1';
const PAYMENT_PENDING = '20';

export function classifyPurchaseError(error: unknown): PurchaseFailure {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';
  if (code === CANCELLED) return 'cancelled';
  if (code === PAYMENT_PENDING) return 'pending';
  return 'failed';
}

export function planIdForPackage(packageType: string, identifier: string): PlanId | null {
  if (packageType === 'ANNUAL') return 'annual';
  if (packageType === 'MONTHLY') return 'monthly';
  if (packageType === 'LIFETIME') return 'lifetime';

  const id = identifier.toLowerCase();
  if (id.includes('annual') || id.includes('yearly')) return 'annual';
  if (id.includes('monthly')) return 'monthly';
  if (id.includes('lifetime')) return 'lifetime';
  return null;
}

export function hasActiveEntitlement(
  active: Record<string, unknown>,
  entitlementIds: readonly string[],
): boolean {
  return entitlementIds.some((id) => Boolean(active[id]));
}

export interface EntitlementSnapshot {
  active: boolean;
  /** ISO date the active entitlement lapses; null for lifetime or inactive. */
  expiresAt: string | null;
}

/** Collapse RevenueCat's active entitlements into what the app caches offline. */
export function entitlementSnapshot(
  active: Record<string, unknown>,
  entitlementIds: readonly string[],
): EntitlementSnapshot {
  const matches = entitlementIds
    .map((id) => active[id])
    .filter((value): value is { expirationDate?: string | null } => Boolean(value) && typeof value === 'object');
  if (!matches.length) return { active: hasActiveEntitlement(active, entitlementIds), expiresAt: null };
  const dates = matches.map((value) => value.expirationDate ?? null);
  if (dates.some((date) => date === null)) return { active: true, expiresAt: null };
  const latest = dates
    .map((date) => Date.parse(date as string))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  return { active: true, expiresAt: latest ? new Date(latest).toISOString() : null };
}

/** A cached entitlement is trusted offline only until its known expiry. */
export function isCachedEntitlementValid(
  snapshot: EntitlementSnapshot,
  now: number = Date.now(),
): boolean {
  if (!snapshot.active) return false;
  if (!snapshot.expiresAt) return true;
  return Date.parse(snapshot.expiresAt) > now;
}
