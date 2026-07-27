import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CONTACT_EMAIL, PRIVACY_POLICY, TERMS_OF_SERVICE } from '../data/legal.ts';

/**
 * Guards roadmap item 18: the contact row actually reaches someone.
 *
 * It was `<Row icon="mail-outline" label={tr('profile.contact')} />` with no
 * `onPress` — `Row` disables itself without one, so the row was inert.
 *
 * `support.ts` imports `expo-clipboard` and `react-native`, so the behaviour is
 * asserted at source level; the address plumbing is checked for real.
 */

const support = readFileSync('src/services/support.ts', 'utf8');
const profile = readFileSync('app/(tabs)/profile.tsx', 'utf8');
const paywall = readFileSync('app/paywall.tsx', 'utf8');

test('the published contact address has one definition', () => {
  assert.match(CONTACT_EMAIL, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  // The policies must carry the same address the app offers to open.
  assert.ok(PRIVACY_POLICY.includes(CONTACT_EMAIL), 'the privacy policy must use CONTACT_EMAIL');
  assert.ok(TERMS_OF_SERVICE.includes(CONTACT_EMAIL), 'the terms must use CONTACT_EMAIL');

  const legal = readFileSync('src/data/legal.ts', 'utf8');
  const hardCoded = legal.split(CONTACT_EMAIL).length - 1;
  // Once in the constant, once in the file header comment — never inside the
  // policy strings, which must interpolate it.
  assert.ok(hardCoded <= 2, `the address is written out ${hardCoded} times; interpolate it instead`);
});

test('the contact row is no longer inert', () => {
  assert.ok(
    !/<Row icon="mail-outline" label=\{tr\('profile\.contact'\)\} \/>/.test(profile),
    'the contact row must not be a Row without onPress',
  );
  assert.match(profile, /icon="mail-outline"[\s\S]{0,200}onPress=\{openContact\}/);
  // The address is visible whether or not anything opens.
  assert.match(profile, /icon="mail-outline"[\s\S]{0,200}value=\{SUPPORT_EMAIL\}/);
});

test('a device with no mail client still gets the address', () => {
  assert.match(support, /Linking\.canOpenURL\(url\)/, 'availability must be checked honestly');
  assert.match(support, /Clipboard\.setStringAsync\(SUPPORT_EMAIL\)/);
  assert.match(support, /return 'copied';/);
  // The caller has to be able to tell the user which of the two happened.
  assert.match(support, /export type SupportOutcome = 'opened' \| 'copied' \| 'failed'/);
  assert.match(profile, /outcome === 'copied'[\s\S]{0,80}toast\(tr\('toast\.contactCopied'\)\)/);
});

test('even a clipboard failure says where to write', () => {
  const handler = profile.slice(profile.indexOf('const openContact'), profile.indexOf('const manageSubscription'));
  assert.match(handler, /outcome === 'failed'/);
  assert.match(handler, /profile\.contactFailedBody[\s\S]{0,80}replace\('\{email\}', SUPPORT_EMAIL\)/);
});

test('support falls back to the published address rather than going dead', () => {
  // EXPO_PUBLIC_SUPPORT_EMAIL is optional; an unset or malformed value must not
  // leave the row without an address, because the policies promise one works.
  assert.match(support, /export const SUPPORT_EMAIL = looksLikeEmail\(configured\) \? configured : CONTACT_EMAIL/);
  assert.match(support, /export const SUPPORT_EMAIL_IS_CONFIGURED = looksLikeEmail\(configured\)/);
});

test('the mailto subject is encoded for mail clients', () => {
  assert.match(support, /URLSearchParams/);
  // URLSearchParams renders spaces as "+", which some clients show literally.
  assert.match(support, /replace\(\/\\\+\/g, '%20'\)/);
});

test('the paywall and the profile share one support path', () => {
  assert.ok(
    !/EXPO_PUBLIC_SUPPORT_EMAIL/.test(paywall),
    'the paywall must not resolve the address itself',
  );
  assert.match(paywall, /from '@\/services\/support'/);
  assert.match(paywall, /sendSupportEmail\(tr\('paywall\.supportSubject'\)\)/);
  assert.match(paywall, /outcome === 'copied'/, 'the paywall should also offer the address');
});
