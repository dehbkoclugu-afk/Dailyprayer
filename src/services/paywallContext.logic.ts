export type BenefitId = 1 | 2 | 3 | 4;

export interface PaywallContext {
  titleKey:
    | 'paywall.title'
    | 'paywall.titleOnboarding'
    | 'paywall.titleSleep'
    | 'paywall.titlePrayer'
    | 'paywall.titlePlan';
  hero:
    | 'A8-paywall-hero'
    | 'A13-plan-cover'
    | 'A10-tonight-night'
    | 'A19-ritual-prayer';
  benefits: BenefitId[];
}

const GENERAL: PaywallContext = {
  titleKey: 'paywall.title',
  hero: 'A8-paywall-hero',
  benefits: [1, 2, 3, 4],
};

export function resolvePaywallContext(from: string | string[] | undefined): PaywallContext {
  if (Array.isArray(from)) return GENERAL;
  if (from === 'onboarding') {
    return {
      titleKey: 'paywall.titleOnboarding',
      hero: 'A13-plan-cover',
      benefits: [1, 2, 3, 4],
    };
  }
  if (from === 'sleep') {
    return {
      titleKey: 'paywall.titleSleep',
      hero: 'A10-tonight-night',
      benefits: [3, 1, 4, 2],
    };
  }
  if (from === 'prayer') {
    return {
      titleKey: 'paywall.titlePrayer',
      hero: 'A19-ritual-prayer',
      benefits: [1, 3, 4, 2],
    };
  }
  if (from === 'plan') {
    return {
      titleKey: 'paywall.titlePlan',
      hero: 'A13-plan-cover',
      benefits: [4, 2, 1, 3],
    };
  }
  return GENERAL;
}
