/**
 * RevenueCat boundary. Production never invents prices, trials, or entitlement.
 * Expo Go keeps an explicit development-only mock so the funnel remains testable.
 */
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { reportError } from '@/lib/reportError';
import {
  classifyPurchaseError,
  entitlementSnapshot,
  planIdForPackage,
  type PlanId,
} from './purchases.logic';

export type { PlanId } from './purchases.logic';

export interface PurchasePlan {
  id: PlanId;
  price: string;
  monthlyPrice: string | null;
  trialEligible: boolean;
  trialDays: number | null;
}

export interface PurchaseCatalog {
  status: 'ready' | 'unavailable';
  plans: PurchasePlan[];
  mock: boolean;
}

export type PurchaseResult =
  | { status: 'purchased' }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'unavailable' }
  | { status: 'failed' };

const DEV_PLANS: PurchasePlan[] = [
  { id: 'annual', price: '$59.99', monthlyPrice: '$4.99', trialEligible: true, trialDays: 7 },
  { id: 'monthly', price: '$9.99', monthlyPrice: '$9.99', trialEligible: false, trialDays: null },
  { id: 'lifetime', price: '$129.99', monthlyPrice: null, trialEligible: false, trialDays: null },
];

const apiKey =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const configuredEntitlementId =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim();
const entitlementIds = Array.from(
  new Set(
    [
      configuredEntitlementId,
      'plus',
      'Lumen Pro',
      'lumen_pro',
      'lumen-pro',
    ].filter((id): id is string => Boolean(id)),
  ),
);

let rc: typeof import('react-native-purchases').default | null = null;
let initPromise: Promise<void> | null = null;
const packages = new Map<PlanId, PurchasesPackage>();

/** Apply RevenueCat's view of the entitlement and return whether Plus is active. */
function applyCustomerInfo(info: CustomerInfo): boolean {
  const snapshot = entitlementSnapshot(info.entitlements.active, entitlementIds);
  useEntitlementStore.getState().setEntitlement(snapshot);
  return snapshot.active;
}

function trialDaysFor(pkg: PurchasesPackage): number | null {
  const intro = pkg.product.introPrice;
  if (intro?.price === 0) {
    const multiplier = intro.periodUnit === 'DAY' ? 1 : intro.periodUnit === 'WEEK' ? 7 : null;
    return multiplier ? intro.periodNumberOfUnits * intro.cycles * multiplier : null;
  }

  const freePhase = pkg.product.defaultOption?.freePhase;
  if (!freePhase) return null;
  const multiplier =
    freePhase.billingPeriod.unit === 'DAY'
      ? 1
      : freePhase.billingPeriod.unit === 'WEEK'
        ? 7
        : null;
  return multiplier
    ? freePhase.billingPeriod.value * (freePhase.billingCycleCount ?? 1) * multiplier
    : null;
}

/**
 * Configure RevenueCat once. Configuration failures are not cached, so the next
 * paywall visit retries; a failed customer-info refresh (e.g. offline launch)
 * keeps the SDK usable and only falls back to the cached, expiry-checked state.
 */
export function initPurchases(): Promise<void> {
  if (initPromise) return initPromise;
  useEntitlementStore.getState().expireIfLapsed();
  initPromise = (async () => {
    if (!apiKey || Platform.OS === 'web') return;
    if (!rc) {
      try {
        const Purchases = (await import('react-native-purchases')).default;
        Purchases.configure({ apiKey });
        Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
        rc = Purchases;
      } catch (error) {
        initPromise = null;
        throw error;
      }
    }
    try {
      applyCustomerInfo(await rc.getCustomerInfo());
    } catch {
      // Offline: the cached entitlement (already expiry-checked) stays in effect.
    }
  })().catch((error) => {
    reportError(error, 'purchases-configure');
    initPromise = null;
  });
  return initPromise ?? Promise.resolve();
}

export async function loadPlans(): Promise<PurchaseCatalog> {
  await initPurchases();
  if (!rc) {
    return __DEV__
      ? { status: 'ready', plans: DEV_PLANS, mock: true }
      : { status: 'unavailable', plans: [], mock: false };
  }

  try {
    const offering = (await rc.getOfferings()).current;
    if (!offering) return { status: 'unavailable', plans: [], mock: false };

    packages.clear();
    const recognized = offering.availablePackages.flatMap((pkg) => {
      const id = planIdForPackage(pkg.packageType, pkg.identifier);
      if (!id) return [];
      packages.set(id, pkg);
      return [{ id, pkg }];
    });
    if (recognized.length === 0) {
      return { status: 'unavailable', plans: [], mock: false };
    }

    const eligibility: Record<string, { status: number }> = await rc
      .checkTrialOrIntroductoryPriceEligibility(
        recognized.map(({ pkg }) => pkg.product.identifier),
      )
      .catch(() => ({}));

    return {
      status: 'ready',
      mock: false,
      plans: recognized.map(({ id, pkg }) => {
        const trialEligible =
          eligibility[pkg.product.identifier]?.status ===
          rc!.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
        return {
          id,
          price: pkg.product.priceString,
          monthlyPrice: pkg.product.pricePerMonthString,
          trialEligible,
          trialDays: trialEligible ? trialDaysFor(pkg) : null,
        };
      }),
    };
  } catch {
    return { status: 'unavailable', plans: [], mock: false };
  }
}

export async function purchase(planId: PlanId): Promise<PurchaseResult> {
  await initPurchases();
  if (!rc) {
    if (!__DEV__) return { status: 'unavailable' };
    useEntitlementStore.getState().setEntitlement({ active: true, expiresAt: null });
    return { status: 'purchased' };
  }

  try {
    if (!packages.has(planId)) await loadPlans();
    const pkg = packages.get(planId);
    if (!pkg) return { status: 'unavailable' };
    const { customerInfo } = await rc.purchasePackage(pkg);
    return applyCustomerInfo(customerInfo) ? { status: 'purchased' } : { status: 'failed' };
  } catch (error) {
    return { status: classifyPurchaseError(error) };
  }
}

/**
 * Restore store purchases. Resolves true/false for found/not found and rejects
 * only when the store could not be reached, so callers can show a retry.
 */
export async function restore(): Promise<boolean> {
  await initPurchases();
  if (!rc) {
    if (__DEV__) return useEntitlementStore.getState().isPlus;
    throw new Error('Purchases are unavailable');
  }
  return applyCustomerInfo(await rc.restorePurchases());
}

export async function openSubscriptionManagement(): Promise<void> {
  const androidPackage = Constants.expoConfig?.android?.package ?? 'com.lumen.dailyprayer';
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : `https://play.google.com/store/account/subscriptions?package=${encodeURIComponent(androidPackage)}`;
  await Linking.openURL(url);
}

/** RevenueCat's anonymous app user ID, quoted to support for data requests. */
export async function getSupportId(): Promise<string | null> {
  await initPurchases();
  if (!rc) return null;
  try {
    return await rc.getAppUserID();
  } catch {
    return null;
  }
}
