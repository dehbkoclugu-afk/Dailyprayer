import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyPurchaseError,
  entitlementSnapshot,
  hasActiveEntitlement,
  isCachedEntitlementValid,
  planIdForPackage,
} from './purchases.logic.ts';

test('classifies RevenueCat cancellation without treating it as a failure', () => {
  assert.equal(classifyPurchaseError({ code: '1' }), 'cancelled');
});

test('classifies a pending store payment', () => {
  assert.equal(classifyPurchaseError({ code: '20' }), 'pending');
});

test('classifies unknown values as failures', () => {
  assert.equal(classifyPurchaseError(new Error('network')), 'failed');
  assert.equal(classifyPurchaseError(null), 'failed');
});

test('maps RevenueCat package types to Selaora plans', () => {
  assert.equal(planIdForPackage('ANNUAL', '$rc_annual'), 'annual');
  assert.equal(planIdForPackage('MONTHLY', '$rc_monthly'), 'monthly');
  assert.equal(planIdForPackage('LIFETIME', '$rc_lifetime'), 'lifetime');
});

test('maps custom package identifiers conservatively', () => {
  assert.equal(planIdForPackage('CUSTOM', 'lumen_annual_v2'), 'annual');
  assert.equal(planIdForPackage('CUSTOM', 'premium-monthly'), 'monthly');
  assert.equal(planIdForPackage('CUSTOM', 'lifetime_access'), 'lifetime');
  assert.equal(planIdForPackage('CUSTOM', 'premium-weekly'), null);
});

test('recognizes the configured or legacy Lumen Pro entitlement', () => {
  const active = { 'Lumen Pro': { identifier: 'Lumen Pro' } };
  assert.equal(hasActiveEntitlement(active, ['plus', 'Lumen Pro']), true);
  assert.equal(hasActiveEntitlement(active, ['plus']), false);
});

test('captures the latest expiry of active entitlements, null for lifetime', () => {
  assert.deepEqual(
    entitlementSnapshot({ plus: { expirationDate: '2026-01-01T00:00:00Z' } }, ['plus']),
    { active: true, expiresAt: '2026-01-01T00:00:00.000Z' },
  );
  assert.deepEqual(entitlementSnapshot({ plus: { expirationDate: null } }, ['plus']), {
    active: true,
    expiresAt: null,
  });
  assert.deepEqual(entitlementSnapshot({}, ['plus']), { active: false, expiresAt: null });
});

test('expired cached entitlements are not trusted offline', () => {
  const now = Date.parse('2026-06-01T00:00:00Z');
  assert.equal(isCachedEntitlementValid({ active: true, expiresAt: '2026-05-01T00:00:00Z' }, now), false);
  assert.equal(isCachedEntitlementValid({ active: true, expiresAt: '2026-07-01T00:00:00Z' }, now), true);
  assert.equal(isCachedEntitlementValid({ active: true, expiresAt: null }, now), true);
  assert.equal(isCachedEntitlementValid({ active: false, expiresAt: null }, now), false);
});
