# Contextual Paywall Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Present the existing Plus offer with a truthful title, benefit order, and first visual matched to the premium feature the user attempted to open.

**Architecture:** A dependency-free resolver converts untrusted route parameters into one of five fixed presentation configurations. Paywall reads that configuration; entry screens only send a closed `from` value.

**Tech Stack:** React Native, Expo Router, TypeScript, Node test runner.

## Global Constraints

- Do not change prices, trials, legal copy, entitlements, or purchase behavior.
- Do not pass content titles, prayer scripts, or Scripture text through route parameters.
- Reuse existing art and benefit strings.
- Do not modify Scripture data or religious text.

---

### Task 1: Pure context resolver

**Files:**
- Create: `src/services/paywallContext.logic.ts`
- Create: `src/services/paywallContext.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `from: string | string[] | undefined`
- Produces: `resolvePaywallContext(from): PaywallContext`

- [x] **Step 1: Write resolver tests**
  Assert exact title key, hero ID, and benefit order for onboarding,
  sleep, prayer, plan, profile, missing, array, and unknown inputs.
- [x] **Step 2: Run the focused test**
  Run `node --experimental-strip-types --test src/services/paywallContext.test.ts`;
  it must fail before the resolver exists.
- [x] **Step 3: Implement the fixed mapping**
  Return immutable configurations and make profile/unknown/malformed inputs use
  the general configuration.
- [x] **Step 4: Add the test to `npm test`**
  Append `src/services/paywallContext.test.ts` to the existing Node command.
- [x] **Step 5: Run the focused test**
  The resolver suite exits 0.

### Task 2: Route entry context

**Files:**
- Modify: `app/(tabs)/pray.tsx`
- Modify: `app/(tabs)/bible.tsx`

**Interfaces:**
- Produces: `/paywall?from=prayer`
- Produces: `/paywall?from=plan`

- [x] **Step 1: Label premium prayer entry**
  Replace only the locked prayer route with `/paywall?from=prayer`.
- [x] **Step 2: Label premium plan entry**
  Replace only the locked plan route with `/paywall?from=plan`.
- [x] **Step 3: Verify every entry**
  Use `rg` to confirm onboarding, profile, sleep, prayer, and plan values all
  have an originating route.

### Task 3: Contextual paywall presentation

**Files:**
- Modify: `app/paywall.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `useLocalSearchParams<{ from?: string | string[] }>()`
- Consumes: `PaywallContext`
- Produces: contextual hero ID, localized title, and reordered benefits

- [x] **Step 1: Add six-locale titles**
  Add onboarding, sleep, prayer, and plan title keys to every UI dictionary.
- [x] **Step 2: Resolve the route parameter**
  Read `from`, call `resolvePaywallContext`, and map its benefit key order through
  the existing translated benefit strings.
- [x] **Step 3: Render context**
  Replace only the fixed hero ID, title key, and benefit array; preserve every
  purchase and restore branch.
- [x] **Step 4: Run static and regression checks**
  Run `npm run typecheck`, `EXPO_NO_TELEMETRY=1 npm run lint`, and
  `npm test -- --runInBand`; all exit 0.
- [x] **Step 5: Export Android**
  Export to `.expo-contextual-paywall`, verify Metro succeeds, then move the
  generated directory into a fresh `/tmp` directory.

### Task 4: Publish checkpoint

**Files:**
- Modify: `docs/design-100.md`
- Modify: `docs/superpowers/plans/2026-07-26-contextual-paywall.md`

**Interfaces:**
- Consumes: verified implementation
- Produces: completed roadmap item 8 and updated draft PR

- [x] **Step 1: Verify scope and locales**
  Count each title key six times, run `git diff --check`, and confirm Scripture
  paths have no diff.
- [x] **Step 2: Mark roadmap item 8 complete**
  Keep numbering stable and update only item 8.
- [x] **Step 3: Commit exact files**
  Commit resolver, test, route entries, paywall, translations, roadmap, spec,
  plan, and package script.
- [x] **Step 4: Publish without force**
  Fast-forward the existing remote branch and verify draft PR #3 points to the
  new remote commit.
