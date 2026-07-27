/**
 * Copy-accuracy release check (roadmap item 20).
 *
 * Everything the app *says* — about licences, prices, trials, notifications and
 * privacy — has to match what it actually *does*. Those claims live in legal text
 * and marketing copy, which nothing else verifies: tests check behaviour, and
 * nobody re-reads a privacy policy against the code before a release.
 *
 * This is that single checklist, and it is enforceable rather than a document:
 * it prints every claim with a verdict and exits non-zero if any of them is not
 * backed by the code.
 *
 *   npm run release-claims     # this file alone
 *   npm run release-check      # this plus the Scripture and rights gates
 *
 * Offline and deterministic, so it runs in CI and before the APK is built.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

/**
 * Files under app/ and src/ containing any of these patterns.
 * `git grep` exits 1 when nothing matches, which here is the passing case.
 */
function filesContaining(...patterns) {
  const args = ['grep', '-lI'];
  for (const pattern of patterns) args.push('-e', pattern);
  args.push('--', 'app', 'src');
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}
/** Comments quote old code and describe intent; claims must be met by code. */
const codeOnly = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const legal = read('src/data/legal.ts');
const paywall = codeOnly(read('app/paywall.tsx'));
const purchases = codeOnly(read('src/services/purchases.ts'));
const notifications = codeOnly(read('src/services/notifications.ts'));
const pkg = JSON.parse(read('package.json'));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

const results = [];
/** @param {string} area @param {string} claim @param {boolean} ok @param {string} [detail] */
const check = (area, claim, ok, detail = '') => results.push({ area, claim, ok, detail });

// ── Licence ───────────────────────────────────────────────────────────────────
// The edition-by-edition rights claims are verified by the Scripture gates; what
// is checked here is that the Terms and the registry cannot describe different
// texts, and that the Terms never make a blanket claim over all six.
{
  const registry = read('src/data/scriptureRights.ts');
  const editions = [...registry.matchAll(/edition: '([^']+)'/g)].map((m) => m[1]);
  check(
    'Licence',
    'Terms name the same six editions the rights registry does',
    editions.length === 6 &&
      editions.every((edition) => {
        // Compare on the distinctive head of the name, before any parenthetical.
        const head = edition.split(' (')[0];
        return legal.includes(head);
      }),
    editions.join(' · '),
  );

  const licensed = [...registry.matchAll(/license: '([^']+)'/g)].map((m) => m[1]);
  check(
    'Licence',
    'every licence named in the registry also appears in the Terms',
    licensed.length > 0 && licensed.every((license) => legal.includes(license)),
    licensed.join(' · '),
  );

  check(
    'Licence',
    'the Terms make no blanket public-domain claim',
    !/all (six )?(Scripture|editions?|translations?)[^.]{0,40}public domain/i.test(legal),
  );
}

// ── Price ─────────────────────────────────────────────────────────────────────
{
  // The paywall must render store-supplied strings, never a literal amount.
  const literalAmount = /['"`][^'"`]*[$€£₺]\s?\d/.test(paywall);
  check('Price', 'the paywall contains no hard-coded price', !literalAmount);

  const devPlansGated = /__DEV__[\s\S]{0,80}DEV_PLANS/.test(purchases);
  const devPlansOnlyOnce = (purchases.match(/DEV_PLANS/g) ?? []).length === 2;
  check(
    'Price',
    'the development price list is unreachable in a release build',
    devPlansGated && devPlansOnlyOnce,
    devPlansGated ? '' : 'DEV_PLANS is not behind __DEV__',
  );

  check(
    'Price',
    'prices shown come from the store product',
    /priceString/.test(purchases) && /pricePerMonthString/.test(purchases),
  );
}

// ── Trial ─────────────────────────────────────────────────────────────────────
{
  // "7 days free" may only appear for someone the store says is eligible.
  const trialStrings = [...paywall.matchAll(/tr\('(paywall\.trial[A-Za-z]*)'\)/g)].map((m) => m[1]);
  const ungated = trialStrings.filter((key) => {
    const at = paywall.indexOf(`tr('${key}')`);
    // Look back for the eligibility test guarding this render.
    return !/trialEligible/.test(paywall.slice(Math.max(0, at - 400), at));
  });
  check(
    'Trial',
    'every trial line is behind an eligibility check',
    trialStrings.length > 0 && ungated.length === 0,
    ungated.length ? `ungated: ${ungated.join(', ')}` : `${trialStrings.length} trial lines`,
  );

  check(
    'Trial',
    'trial length comes from the store offer, not a constant',
    /introPrice|intro\?\.price/.test(purchases) && /trialDaysFor/.test(purchases),
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
{
  const claimsLocal = /scheduled \*\*locally on your device\*\*/.test(legal);
  check('Notifications', 'the Privacy Policy claims notifications are local-only', claimsLocal);

  const remotePush = /getExpoPushTokenAsync|getDevicePushTokenAsync|registerForPushNotifications/.test(
    notifications,
  );
  check('Notifications', 'no remote push token is ever requested', !remotePush);

  check(
    'Notifications',
    'the policy claim that we run no push server holds',
    /We do not run a server that sends you push messages/.test(legal) &&
      !/firebase|onesignal|@react-native-firebase/i.test(deps.join(' ')),
  );

  check(
    'Notifications',
    'reminders are only scheduled locally',
    /scheduleNotificationAsync/.test(notifications) && !remotePush,
  );
}

// ── Privacy ───────────────────────────────────────────────────────────────────
{
  const analytics = [
    'posthog',
    'amplitude',
    '@segment',
    'mixpanel',
    'firebase',
    '@sentry',
    'appsflyer',
    'react-native-google-analytics',
  ].filter((name) => deps.some((dep) => dep.toLowerCase().includes(name)));
  check(
    'Privacy',
    'the "no analytics or tracking" claim holds — no such dependency ships',
    analytics.length === 0,
    analytics.join(', '),
  );

  const authFiles = filesContaining('signIn', 'signUp', 'createUser', 'currentUser');
  check(
    'Privacy',
    'the "no account is required" claim holds — no sign-in exists',
    authFiles.length === 0 &&
      !deps.some((dep) => /firebase|google-signin|auth0|clerk|supabase/i.test(dep)),
    authFiles.join(', '),
  );

  check(
    'Privacy',
    'the policy names the payment processor the app actually uses',
    /RevenueCat/.test(legal) && deps.includes('react-native-purchases'),
  );

  // Tests are excluded: they read source text and legitimately mention these names.
  const networkFiles = filesContaining('fetch(', 'axios', 'XMLHttpRequest').filter(
    (file) => !/\.test\.tsx?$/.test(file),
  );
  check(
    'Privacy',
    'the "stored only on your device" claim holds — no HTTP client in app code',
    networkFiles.length === 0,
    networkFiles.join(', '),
  );

  check(
    'Privacy',
    'the in-app contact address matches the one the policies publish',
    /export const CONTACT_EMAIL = '([^']+)'/.test(legal) &&
      legal.includes('${CONTACT_EMAIL}'),
  );
}

// ── Report ────────────────────────────────────────────────────────────────────
const failures = results.filter((r) => !r.ok);
let area = '';
for (const result of results) {
  if (result.area !== area) {
    area = result.area;
    console.log(`\n${area}`);
  }
  const mark = result.ok ? '  ✓' : '  ✗';
  console.log(`${mark} ${result.claim}${result.detail ? `\n      ${result.detail}` : ''}`);
}

console.log('');
if (failures.length) {
  console.error(
    `Copy-accuracy check FAILED — ${failures.length} of ${results.length} claims are not backed by the code.\n` +
      'Either change the behaviour to match what the app says, or change what it says.\n' +
      'A claim in a policy is a promise; shipping one the code does not keep is the defect.',
  );
  process.exit(1);
}
console.log(`Copy-accuracy check passed — all ${results.length} claims match the code.`);
