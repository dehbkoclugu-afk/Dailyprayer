import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const REQUIRED = {
  'store-prices-only': [
    ['src/services/purchases.ts', /__DEV__\s*\?[\s\S]*DEV_PLANS[\s\S]*status:\s*'unavailable'/],
    ['app/paywall.tsx', /catalog\.status === 'unavailable'/],
    ['app/paywall.tsx', /selectedPlan\.price/],
  ],
  'trial-eligibility': [
    ['src/services/purchases.ts', /checkTrialOrIntroductoryPriceEligibility/],
    ['src/services/purchases.ts', /trialEligible,\s*trialDays:\s*trialEligible/],
    ['app/paywall.tsx', /plan\.trialEligible/],
  ],
  'local-notifications': [
    ['src/data/legal.ts', /notifications are scheduled \*\*locally on your device\*\*/],
    ['src/services/notifications.ts', /requestPermissionsAsync/],
    ['src/services/notifications.ts', /scheduleNotificationAsync/],
    ['app/(tabs)/profile.tsx', /openSettings/],
  ],
  'local-private-data': [
    ['src/data/legal.ts', /stored \*\*only on[\s\S]*your device\*\*/],
    ['src/lib/localDataKeys.ts', /LOCAL_USER_DATA_KEYS/],
    ['src/lib/localDataKeys.test.ts', /lumen-entitlement/],
    ['src/lib/localDataKeys.test.ts', /lumen-application-content-v1/],
  ],
  'scripture-rights': [
    ['src/data/legal.ts', /40 checksum-pinned source/],
    ['scripts/verify-scripture-integrity.mjs', /SHA|sha|digest/],
    ['scripts/verify-scripture-release-rights.mjs', /rights|license|source/i],
  ],
  'truthful-subscription-copy': [
    ['app/paywall.tsx', /\{tr\('profile\.plusActive'\)\}/],
    ['app/(tabs)/profile.tsx', /!isPlus[\s\S]*tr\('profile\.plusSub'\)/],
    ['docs/store-listing.md', /^(?![\s\S]*(?:journal export|günlük dışa aktarma|exportación del diario|exportação do diário|export du journal|Tagebuch-Export|someone who can't afford|karşılayamayan|alguien que no puede pagarlo|quem não pode pagar|quelqu'un qui ne peut pas se le permettre|jemandem zu schenken))[\s\S]*$/],
    ['src/data/legal.ts', /RevenueCat processes purchase history and an[\s\S]*anonymous app user identifier/],
  ],
};

export function verifyReleaseClaims({ readFile = read } = {}) {
  const manifest = JSON.parse(readFile('docs/release-claims.json'));
  const ids = manifest.claims.map((claim) => claim.id);
  const failures = [];
  for (const id of Object.keys(REQUIRED)) {
    if (!ids.includes(id)) failures.push(`${id}: missing manifest claim`);
    for (const [path, pattern] of REQUIRED[id]) {
      let content = '';
      try { content = readFile(path); } catch { failures.push(`${id}: missing evidence file ${path}`); continue; }
      if (!pattern.test(content)) failures.push(`${id}: runtime evidence drifted in ${path}`);
    }
  }
  for (const claim of manifest.claims) {
    if (!REQUIRED[claim.id]) failures.push(`${claim.id}: claim has no fail-closed verifier`);
    if (!claim.statement || !Array.isArray(claim.evidence) || claim.evidence.length === 0) failures.push(`${claim.id}: incomplete claim metadata`);
  }
  return failures;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const failures = verifyReleaseClaims();
  if (failures.length) {
    console.error(`Release claim verification failed:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`Release claim verification passed (${root}).`);
}
