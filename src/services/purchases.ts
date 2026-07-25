/**
 * RevenueCat wrapper. The rest of the app only talks to this module and the
 * entitlement store — never to the SDK directly. In Expo Go (no native module)
 * it degrades to a mock so the full funnel is testable in development.
 */
import { Linking, Platform } from 'react-native';
import { useEntitlementStore } from '@/state/useEntitlementStore';

export type PlanId = 'weekly' | 'annual' | 'lifetime';

export interface Plan {
  id: PlanId;
  title: string;
  price: string;
  period: string;
  badge?: string;
  trialDays?: number;
}

/** Displayed plans; live prices are overridden by RevenueCat offerings when available. */
export const FALLBACK_PLANS: Plan[] = [
  { id: 'annual', title: 'Yearly', price: '$59.99', period: '/year', badge: 'SAVE 88%', trialDays: 7 },
  { id: 'weekly', title: 'Weekly', price: '$9.99', period: '/week' },
  { id: 'lifetime', title: 'Lifetime', price: '$129.99', period: 'once' },
];

const API_KEYS = {
  ios: 'appl_REPLACE_ME',
  android: 'goog_REPLACE_ME',
};

let rc: typeof import('react-native-purchases').default | null = null;

export async function initPurchases(): Promise<void> {
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    if (key.includes('REPLACE_ME')) return; // dev mode — mock only
    Purchases.configure({ apiKey: key });
    rc = Purchases;
    const info = await Purchases.getCustomerInfo();
    useEntitlementStore
      .getState()
      .setPlus(Boolean(info.entitlements.active['plus']));
  } catch {
    // Expo Go / web: native module unavailable → stay in mock mode.
    rc = null;
  }
}

export async function purchase(planId: PlanId): Promise<boolean> {
  if (!rc) {
    // Dev mock: grant entitlement locally so the funnel is testable.
    useEntitlementStore.getState().setPlus(true);
    return true;
  }
  const offerings = await rc.getOfferings();
  const pkg = offerings.current?.availablePackages.find((p) =>
    p.identifier.toLowerCase().includes(planId),
  );
  if (!pkg) return false;
  const { customerInfo } = await rc.purchasePackage(pkg);
  const active = Boolean(customerInfo.entitlements.active['plus']);
  useEntitlementStore.getState().setPlus(active);
  return active;
}

export async function restore(): Promise<boolean> {
  if (!rc) return useEntitlementStore.getState().isPlus;
  const info = await rc.restorePurchases();
  const active = Boolean(info.entitlements.active['plus']);
  useEntitlementStore.getState().setPlus(active);
  return active;
}

export async function openSubscriptionManagement(): Promise<void> {
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions?package=com.lumen.dailyprayer';
  await Linking.openURL(url);
}
