# Global Application Localization Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Ship complete application localization for the 40 full-Bible release-candidate locale tags plus the existing licensed Turkish locale without translating or modifying Scripture.

**Architecture:** Keep compact UI dictionaries bundled and move first-party long-form content behind versioned, checksum-verified locale packs. Reuse the Bible-pack validation, download, and storage pattern; activate a locale only after its complete content pack is valid, while keeping application and Scripture preferences independent.

**Tech Stack:** Expo 53, React Native, TypeScript, Zustand, AsyncStorage, Expo FileSystem, Expo Crypto, Node test runner, GitHub Release assets.

## Global Constraints

- Never translate, paraphrase, regenerate, or edit Scripture text or Bible pack assets.
- Preserve Turkish YTC as the separately licensed bundled Scripture edition.
- Add no runtime translation service, backend, account system, or new dependency.
- Treat stable IDs, routes, artwork IDs, product data, durations, and Scripture chapter/verse identity as non-translatable structure.
- Advertise a locale only when bundled UI and a complete content release both pass validation.
- Commit after each independently passing task.

---

### Task 1: Define the 41-locale application contract

**Files:**
- Modify: `src/i18n/applicationLocales.ts`
- Modify: `src/i18n/translations.test.ts`
- Test: `src/i18n/translations.test.ts`

**Interfaces:**
- Consumes: `RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS` and `GLOBAL_LANGUAGE_CATALOG`
- Produces: `APPLICATION_LOCALE_CANDIDATES`, `RTL_APPLICATION_LOCALE_CANDIDATES`; keeps `APPLICATION_LOCALES` as the fully translated production subset until Tasks 6 and 7 pass

- [ ] **Step 1: Write the failing catalog tests**

  Add assertions equivalent to:

  ```ts
  test('application rollout targets the 40 release candidates plus Turkish', () => {
    assert.equal(APPLICATION_LOCALE_CANDIDATES.length, 41);
    assert.deepEqual(
      new Set(APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag)),
      new Set([...RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS, 'tr']),
    );
  });

  test('application rollout marks only Arabic and Persian RTL', () => {
    assert.deepEqual(new Set(RTL_APPLICATION_LOCALE_CANDIDATES), new Set(['ar', 'fa']));
  });
  ```

- [ ] **Step 2: Run the focused test and verify the expected failure**

  Run `node --experimental-strip-types --test src/i18n/translations.test.ts` and confirm it fails because the rollout-candidate exports do not exist.

- [ ] **Step 3: Derive the application catalog from the global catalog**

  Build `APPLICATION_LOCALE_CANDIDATES` by filtering `GLOBAL_LANGUAGE_CATALOG` to `RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS` plus `tr`, preserving each tag, native name, and direction. Keep the eight fully translated `APPLICATION_LOCALES` advertised until Tasks 6 and 7 complete, preventing English fallback from becoming a production locale. Keep BCP-47 Chinese/Serbian resolution behavior.

- [ ] **Step 4: Run focused verification**

  Run `npm run typecheck` and the focused translation test; both must pass without changing Scripture files.

- [ ] **Step 5: Commit**

  Commit `src/i18n/applicationLocales.ts` and `src/i18n/translations.test.ts` with message `Define global application locale catalog`.

### Task 2: Define and validate application-content packs

**Files:**
- Create: `src/data/applicationContentPack.ts`
- Create: `src/data/applicationContentPack.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `AppLocale`, stable prayer IDs, devotional IDs, plan IDs, and quiz keys/options
- Produces: `APPLICATION_CONTENT_PACK_SCHEMA_VERSION`, `ApplicationContentPack`, `ApplicationContentRelease`, `validateApplicationContentPack(value, expectedLocale)`

- [ ] **Step 1: Write failing schema tests**

  Cover a minimal valid pack and rejection cases with actual assertions:

  ```ts
  test('rejects an application-content pack for the wrong locale', () => {
    assert.throws(
      () => validateApplicationContentPack(validPack, 'fr'),
      /locale mismatch/,
    );
  });

  test('rejects missing or duplicate stable content ids', () => {
    const broken = structuredClone(validPack);
    broken.prayers.pop();
    assert.throws(() => validateApplicationContentPack(broken, 'en'), /prayer ids/);
  });
  ```

  The valid fixture must contain every source ID, not a reduced fake collection.

- [ ] **Step 2: Run it and verify the expected failure**

  Run `node --experimental-strip-types --test src/data/applicationContentPack.test.ts` and confirm it fails because the module does not exist.

- [ ] **Step 3: Implement the minimum pack contract**

  Define schema version `1`; locale; content version; review status (`release-candidate` or `reviewed`); quiz text; prayer title/script overlays; devotional title/body overlays; and plan title/tagline overlays. Validate exact stable-ID sets, non-empty strings, array lengths, duplicate IDs, expected locale, and unresolved interpolation markers. Do not include any Bible verse text field.

- [ ] **Step 4: Add the test to the standard suite and verify**

  Add the test file to `npm test`, then run `npm run typecheck && npm test` and expect all tests to pass.

- [ ] **Step 5: Commit**

  Commit the three listed files with message `Add application content pack contract`.

### Task 3: Add manifest validation and verified storage

**Files:**
- Create: `src/services/applicationContentRegistry.ts`
- Create: `src/services/applicationContentRegistry.test.ts`
- Create: `src/services/applicationContentPacks.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ApplicationContentPack`, `ApplicationContentRelease`, `SUPPORTED_LOCALES`
- Produces: `fetchApplicationContentManifest()`, `applicationContentReleaseMap()`, `installApplicationContentPack()`, `loadInstalledApplicationContentPack()`, `isApplicationContentPackInstalled()`

- [ ] **Step 1: Write failing pure manifest tests**

  Test exact 41-locale coverage, duplicate locale rejection, SHA-256 format, positive byte size, non-empty version, HTTPS URL, and unexpected locale rejection. Use `validateApplicationContentManifest(value)` so network is not needed in unit tests.

- [ ] **Step 2: Run the registry test and verify module failure**

  Run `node --experimental-strip-types --test src/services/applicationContentRegistry.test.ts` and confirm the missing module failure.

- [ ] **Step 3: Implement registry and release mapping**

  Add manifest schema version `1`, a GitHub Release manifest URL, pure validation, fetch with `Accept: application/json`, and a typed locale-to-release map.

- [ ] **Step 4: Implement verified atomic storage**

  Mirror `src/services/biblePacks.ts`: for the requested locale tag, download to a `.json.download` sibling of its target JSON file, require successful HTTP status, calculate SHA-256, validate pack locale/schema/content IDs, then replace the installed file. Delete only the temporary file on failure and retain the last valid installed file.

- [ ] **Step 5: Run verification and commit**

  Add the pure registry test to `npm test`; run `npm run typecheck && npm test`; commit the listed files with message `Add verified application content delivery`.

### Task 4: Add active content-pack state and selectors

**Files:**
- Create: `src/state/useApplicationContentStore.ts`
- Create: `src/i18n/applicationContent.ts`
- Modify: `src/data/quiz.ts`
- Modify: `src/data/prayers.ts`
- Modify: `src/data/devotionals.ts`
- Modify: `src/data/plans.ts`
- Create: `src/i18n/applicationContent.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: bundled English pack, validated installed pack, current `AppLocale`
- Produces: `registerApplicationContentPack(pack)`, `getApplicationContent(locale)`, and existing `getQuiz(locale)`, `getPrayers(locale)`, `getDevotionals(locale)`, `getPlans(locale)` behavior

- [ ] **Step 1: Write failing selector tests**

  Assert that registering a complete French fixture changes every first-party collection to French, that an unregistered locale returns the complete English pack rather than field-level mixing, and that plan/prayer IDs and structural fields remain byte-identical.

- [ ] **Step 2: Run the focused test and confirm failure**

  Run `node --experimental-strip-types --test src/i18n/applicationContent.test.ts` and confirm the missing content boundary failure.

- [ ] **Step 3: Create the content boundary and recovery baseline**

  Build a bundled English `ApplicationContentPack` from the existing canonical content. Keep one in-memory map of validated packs. Return a whole-pack English fallback only; never mix fields from different locales.

- [ ] **Step 4: Route existing selectors through the boundary**

  Preserve the screen-facing function names and stable return shapes. Remove duplicated locale switch maps only after each existing locale has an equivalent pack fixture and selector tests pass.

- [ ] **Step 5: Verify and commit**

  Add the new test to `npm test`; run `npm run typecheck && npm test && npm run lint`; commit with message `Route localized content through validated packs`.

### Task 5: Make application-language selection atomic

**Files:**
- Create: `app/application-language.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `src/state/useUserStore.ts`
- Modify: `src/i18n/index.ts`
- Create: `src/i18n/applicationLanguageActivation.ts`
- Create: `src/i18n/applicationLanguageActivation.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: current application locale, manifest releases, installed packs, `setLanguage()`
- Produces: `activateApplicationLocale(tag)`, language picker download/progress/retry UI

- [ ] **Step 1: Write failing activation tests**

  Inject fake load/install/register/set dependencies and assert that `setLanguage(tag)` occurs only after validation/registration; install failure leaves the old language unchanged; bundled English activates without network; and Scripture preference is never read or written.

- [ ] **Step 2: Run the activation test and confirm failure**

  Run `node --experimental-strip-types --test src/i18n/applicationLanguageActivation.test.ts` and confirm the module does not exist.

- [ ] **Step 3: Implement the pure activation coordinator**

  Load an installed pack first, install from a manifest release only when absent, register it, then persist the application locale. Throw typed errors for unavailable release, download/integrity failure, and activation failure.

- [ ] **Step 4: Build the language picker using the Scripture picker pattern**

  List all advertised application locales with native labels and download state. Keep the current locale active while downloading. Show localized unavailable/retry messaging and return only after successful activation. Link Profile's application-language row to this route.

- [ ] **Step 5: Verify and commit**

  Add the activation test to `npm test`; run `npm run typecheck && npm test && npm run lint`; commit with message `Activate application languages atomically`.

### Task 6: Add complete bundled UI dictionaries

**Files:**
- Create: `src/i18n/locales/` modules named by each of the 41 application locale tags
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

**Interfaces:**
- Consumes: English `TranslationKey` contract
- Produces: `translations: Record<AppLocale, Record<TranslationKey, string>>`

- [ ] **Step 1: Strengthen failing completeness tests**

  Require every `SUPPORTED_LOCALES` entry to have exactly the English key set, non-empty values, preserved interpolation tokens, no synthetic sentinel values, and no English-source equality except an explicit allowlist for brands/proper nouns.

- [ ] **Step 2: Run the focused test and confirm missing dictionaries**

  Run `node --experimental-strip-types --test src/i18n/translations.test.ts` and confirm it reports every unimplemented locale.

- [ ] **Step 3: Split existing dictionaries without changing copy**

  Move the eight existing dictionaries into locale modules and keep the public `translations`, `Locale`, and `TranslationKey` exports compatible.

- [ ] **Step 4: Add locale modules in reviewable batches**

  Add dictionaries in these exact batches, running the focused test after each batch:

  1. `ar`, `fa`, `zh-Hans`, `zh-Hant`, `ja`, `ko`
  2. `hr`, `cs`, `eo`, `ro`, `ru`, `sr-Latn`, `sr-Cyrl`, `uk`
  3. `sq`, `da`, `fi`, `hu`, `lv`, `no`, `pl`, `sv`
  4. `my`, `cek`, `hlt`, `ht`, `haw`, `kos`, `la`, `to`, `vi`, `mi`, `tl`

  Preserve variables and store-supplied price behavior. Mark the locale module metadata `release-candidate`.

- [ ] **Step 5: Verify and commit each batch**

  For each batch run `npm run typecheck && node --experimental-strip-types --test src/i18n/translations.test.ts`. Commit the four batches respectively as `Add Asian and RTL UI localizations`, `Add European UI localizations`, `Add Northern European UI localizations`, and `Add remaining global UI localizations`.

### Task 7: Generate and validate the 41 first-party content packs

**Files:**
- Create: `scripts/build-application-content-packs.mjs`
- Create: `content/application/` JSON files named by each of the 41 application locale tags
- Create: `content/application/manifest.json`
- Create: `scripts/validate-application-content-packs.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: stable English source IDs/content, reviewed translations, application-content schema
- Produces: deterministic locale JSON artifacts and manifest entries with byte size/SHA-256

- [ ] **Step 1: Add a failing artifact validator**

  The validator must load all 41 JSON files, call the same schema rules, check exact locale coverage, reject English leakage outside a proper-noun allowlist, verify interpolation markers, and confirm no pack contains fields named `verseText`, `scriptureText`, `chapters`, or `books`.

- [ ] **Step 2: Run validation and confirm missing artifacts**

  Run `npm run application-content:verify` and confirm it reports the 41 missing locale artifacts.

- [ ] **Step 3: Add deterministic English and existing-locale artifacts**

  Export English plus the seven existing non-English locale overlays into complete pack files, preserving stable IDs and existing translations. Run validation and require only the remaining 33 locales to fail.

- [ ] **Step 4: Add translated packs in the same four review batches as Task 6**

  Translate only first-party content. Preserve structure, interpolation markers, identifiers, URLs, timings, and Scripture reference identity. Each batch must pass schema, source-leakage, and forbidden-Scripture-field validation before commit.

- [ ] **Step 5: Generate the release manifest**

  Calculate UTF-8 byte size and SHA-256 for each validated pack and emit deterministic GitHub Release URLs. Re-run the validator against both artifacts and manifest.

- [ ] **Step 6: Verify and commit each batch**

  Run `npm run application-content:verify && npm run typecheck && npm test`. Commit the four batches respectively as `Add Asian and RTL application content`, `Add European application content`, `Add Northern European application content`, and `Add remaining global application content`.

### Task 8: Implement RTL root behavior and directional UI

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `src/i18n/index.ts`
- Modify: `app/application-language.tsx`
- Modify: directional shared components found by `rg "chevron-(back|forward)|arrow-(back|forward)|flexDirection|textAlign|writingDirection" app src`
- Create: `src/i18n/direction.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `getApplicationLocale(locale).direction`
- Produces: coherent root direction and `isRTL`/directional-icon helpers

- [ ] **Step 1: Write failing direction tests**

  Assert Arabic/Persian return RTL, all other application locales return LTR, back/forward icon names mirror only in RTL, and non-directional playback controls remain unchanged.

- [ ] **Step 2: Run the focused test and confirm helper failure**

  Run `node --experimental-strip-types --test src/i18n/direction.test.ts` and confirm the helper module or exports are absent.

- [ ] **Step 3: Implement minimum root direction handling**

  Derive direction from the active application locale and remount the navigation root on LTR/RTL boundary changes. Use `writingDirection`, alignment, row direction, and directional icon helpers at shared boundaries; do not mirror artwork or playback controls.

- [ ] **Step 4: Verify and visually smoke**

  Run `npm run typecheck && npm test && npm run lint && EXPO_NO_TELEMETRY=1 npx expo export --platform android`. Capture representative English, Arabic, and Persian screens for onboarding, Today, paywall, player, Profile, and both language pickers.

- [ ] **Step 5: Commit**

  Commit only direction-related files with message `Support RTL application locales`.

### Task 9: Publish-ready release gate and documentation

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `docs/global-scripture-rollout.md`
- Modify: `docs/go-live-checklist.md`
- Modify: `README.md`
- Test: all localization and Scripture-integrity tests

**Interfaces:**
- Consumes: built UI dictionaries, 41 validated content packs, manifest, existing Scripture integrity checks
- Produces: CI release gate and accurate operator documentation

- [ ] **Step 1: Add localization verification to CI**

  Discover the existing workflow with `rg --files .github/workflows`; add `npm run application-content:verify` after unit tests and before Android export. Keep existing Scripture verification unchanged.

- [ ] **Step 2: Update operator documentation**

  Document the 41 application locales, independent Scripture selection, content-pack GitHub Release tag/manifest, artifact publishing order, editorial `release-candidate` status, and rollback to the last valid manifest.

- [ ] **Step 3: Run the full release gate**

  Run:

  ```sh
  npm ci --cache /tmp/dailyprayer-npm-cache
  npm run typecheck
  npm test
  npm run lint
  npm run application-content:verify
  npm run bible:pack:verify
  EXPO_NO_TELEMETRY=1 npx expo export --platform android
  git diff --check
  ```

  All commands must pass. Confirm `git diff --name-only` contains no `src/data/bible-full.*.json`, released Bible pack, or Scripture source artifact changes.

- [ ] **Step 4: Commit**

  Commit CI and documentation with message `Gate global localization releases`.

### Task 10: Publish content assets and perform device QA

**Files:**
- No source edits expected after artifacts pass Task 9
- Upload: `content/application/*.json`
- Upload: `content/application/manifest.json`

**Interfaces:**
- Consumes: validated content artifacts and GitHub release access
- Produces: versioned `application-content-v1` release assets reachable by the production manifest URLs

- [ ] **Step 1: Create the GitHub release assets**

  Publish the 41 pack JSON files under tag `application-content-v1`, verify uploaded byte sizes, then publish the manifest last so clients cannot discover incomplete assets.

- [ ] **Step 2: Verify production URLs and checksums**

  Download every manifest URL into a temporary directory, recompute SHA-256, and compare locale/version/bytes/digest to the manifest.

- [ ] **Step 3: Run real-device localization QA**

  On Android and iOS, test one LTR Latin locale, Chinese, Japanese, Arabic, Persian, and one Serbian script variant. Verify fresh download, offline restart, corrupt/interrupted update recovery, language switching, purchases/paywall copy, notifications, app-language/Scripture-language independence, font rendering, and RTL navigation.

- [ ] **Step 4: Record release readiness**

  Mark the localization and physical-device rows complete in `docs/go-live-checklist.md` only after both platform checks pass; commit any factual checklist update with message `Record global localization device QA`.
