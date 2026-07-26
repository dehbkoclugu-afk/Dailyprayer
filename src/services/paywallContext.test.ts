import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePaywallContext } from './paywallContext.logic.ts';

test('resolves every supported paywall source', () => {
  assert.deepEqual(resolvePaywallContext('onboarding'), {
    titleKey: 'paywall.titleOnboarding',
    hero: 'A13-plan-cover',
    benefits: [1, 2, 3, 4],
  });
  assert.deepEqual(resolvePaywallContext('sleep'), {
    titleKey: 'paywall.titleSleep',
    hero: 'A10-tonight-night',
    benefits: [3, 1, 4, 2],
  });
  assert.deepEqual(resolvePaywallContext('prayer'), {
    titleKey: 'paywall.titlePrayer',
    hero: 'A19-ritual-prayer',
    benefits: [1, 3, 4, 2],
  });
  assert.deepEqual(resolvePaywallContext('plan'), {
    titleKey: 'paywall.titlePlan',
    hero: 'A13-plan-cover',
    benefits: [4, 2, 1, 3],
  });
});

test('uses the general presentation for profile and untrusted values', () => {
  const general = {
    titleKey: 'paywall.title',
    hero: 'A8-paywall-hero',
    benefits: [1, 2, 3, 4],
  };
  assert.deepEqual(resolvePaywallContext('profile'), general);
  assert.deepEqual(resolvePaywallContext(undefined), general);
  assert.deepEqual(resolvePaywallContext(['sleep']), general);
  assert.deepEqual(resolvePaywallContext('unknown'), general);
});
