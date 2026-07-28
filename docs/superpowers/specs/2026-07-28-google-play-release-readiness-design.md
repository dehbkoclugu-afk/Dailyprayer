# Google Play release readiness

**Goal:** Make every repository-owned Android release requirement accurate and
repeatable, leaving only account, credential, billing-product, tester, and Play
Console actions to the publisher.

## Chosen approach

Use the existing Expo/EAS and GitHub Actions setup instead of adding another
release service. Produce an AAB through EAS for Play, retain the current APK job
for install/smoke testing, and make one release command validate a build artifact
that already exists.

Alternatives rejected:

- Converting the APK workflow into a hand-maintained Gradle signing pipeline
  duplicates EAS credential management and makes key rotation our problem.
- Shipping manually from a developer laptop is shorter once, but cannot prove
  that the same checks run for every release.

## Repository changes

### Build and release gates

- Keep the current APK workflow as a device-smoke artifact.
- Add a production Android AAB workflow that uses EAS non-interactively and
  requires `EXPO_TOKEN`.
- Split source validation from artifact-size validation. `release-check` must run
  before the build; `bundle-budget` must run only after an export exists.
- Pin/verify Android target SDK expectations. API 35 is the minimum before
  31 August 2026; API 36 becomes the submission minimum on that date.
- Document Play App Signing and service-account requirements without committing
  secrets.

### Claims and legal copy

- Make hosted privacy/terms Markdown agree with the in-app canonical legal text:
  Umut Ceylan, `dehbkoclugu@gmail.com`, Turkey, local-only user content,
  RevenueCat purchase status, and local notifications.
- Remove unsupported store claims: journal export, donation/gifting, unconditional
  free trial, and the assertion that every locale uses World English Bible.
- Keep localized listing text but use per-locale Scripture source wording.

### Play Console handoff

Add one concise handoff document containing:

- Data Safety answers for local journal/profile/progress data and RevenueCat;
- ads, target audience, content rating, app access, and permissions declarations;
- required store assets and screenshot matrix;
- closed-test requirement for eligible personal accounts;
- production checklist for products, RevenueCat entitlement, sandbox purchase,
  restore, notifications, real-device QA, AAB upload, and staged rollout.

The document must distinguish facts inferred from source from answers the account
owner must verify in Play Console.

## Data and secrets

No private keys enter Git. Public RevenueCat SDK keys and `EXPO_TOKEN` live in EAS
or GitHub environment secrets. The Play service-account JSON remains ignored and
is only needed for automated submission; manual AAB upload stays supported.

## Failure behavior

- Missing release secrets stop the AAB workflow with a named setup error.
- Missing build output stops size validation instead of silently skipping it.
- Source/legal/Scripture checks run before any paid build minutes are consumed.
- A purchase catalog that cannot load remains unavailable in production and never
  grants Plus.

## Verification

- `npm test`, `npm run typecheck`, `npm run lint`, and `npm run release-check`.
- Android export followed by `npm run bundle-budget -- <output>`.
- Validate workflow YAML and confirm no secret or generated artifact is tracked.
- Review the final diff for unsupported store claims and unresolved placeholders.
- Physical-device purchase, restore, reminder, accessibility, and closed testing
  remain human gates because they require store accounts and real devices.

## Success criteria

After implementation, a maintainer can create a policy-checked production AAB
without editing source files. Repository documents contain no false launch claims
or legal placeholders. The remaining checklist contains only external-account and
real-device actions.
