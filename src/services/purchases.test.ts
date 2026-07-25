import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyPurchaseError, planIdForPackage } from './purchases.logic.ts';

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

test('maps RevenueCat package types to Lumen plans', () => {
  assert.equal(planIdForPackage('ANNUAL', '$rc_annual'), 'annual');
  assert.equal(planIdForPackage('WEEKLY', '$rc_weekly'), 'weekly');
  assert.equal(planIdForPackage('LIFETIME', '$rc_lifetime'), 'lifetime');
});

test('maps custom package identifiers conservatively', () => {
  assert.equal(planIdForPackage('CUSTOM', 'lumen_annual_v2'), 'annual');
  assert.equal(planIdForPackage('CUSTOM', 'premium-weekly'), 'weekly');
  assert.equal(planIdForPackage('CUSTOM', 'lifetime_access'), 'lifetime');
  assert.equal(planIdForPackage('CUSTOM', 'monthly'), null);
});
