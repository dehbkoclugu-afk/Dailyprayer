# Subscription Management Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Add a truthful, localized store-subscription management action for active Lumen Plus members.

**Architecture:** Keep platform URL ownership in `src/services/purchases.ts` and reuse its existing `openSubscriptionManagement()` boundary. Profile renders one conditional action inside the existing Plus card and owns only the user-facing error alert.

**Tech Stack:** React Native, Expo Router, TypeScript, RevenueCat boundary, Node test runner.

## Global Constraints

- Preserve the inactive card’s existing paywall behavior.
- Add no dependency, route, or screen.
- Do not modify Scripture data or religious text.
- Keep every action at least 48 dp high and localized in all six UI locales.

---

### Task 1: Active Plus management action

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `isPlus: boolean`
- Consumes: `openSubscriptionManagement(): Promise<void>`
- Produces: a conditional localized button inside the active subscription card

- [x] **Step 1: Add six-locale interface copy**
  Add `profile.manageSubscription`, `profile.manageSubscriptionErrorTitle`, and
  `profile.manageSubscriptionErrorBody` to every UI locale dictionary.
- [x] **Step 2: Import the existing store boundary**
  Import `openSubscriptionManagement` from `@/services/purchases`.
- [x] **Step 3: Add the minimum interaction**
  Keep the whole card clickable only when inactive. When active, append a divided
  48 dp action row that calls the service and catches a rejection with `Alert.alert`.
- [x] **Step 4: Run static verification**
  Run `npm run typecheck` and `EXPO_NO_TELEMETRY=1 npm run lint`; both must exit 0.
- [x] **Step 5: Run regression tests**
  Run `npm test -- --runInBand`; all existing 17 tests must pass.

### Task 2: Release checkpoint

**Files:**
- Modify: `docs/design-100.md`
- Modify: `docs/superpowers/plans/2026-07-26-subscription-management.md`

**Interfaces:**
- Consumes: verified implementation
- Produces: stable roadmap status and a published GitHub checkpoint

- [x] **Step 1: Export Android**
  Run `EXPO_NO_TELEMETRY=1 npx expo export --platform android --output-dir .expo-subscription-management`
  and verify Metro completes.
- [x] **Step 2: Protect generated output**
  Move `.expo-subscription-management` into a fresh `/tmp` directory so it is not committed.
- [x] **Step 3: Mark roadmap item 6 complete**
  Preserve all numbering and update only item 6 in `docs/design-100.md`.
- [x] **Step 4: Verify scope**
  Run `git diff --check`, inspect `git diff --name-only`, and confirm no Scripture data path changed.
- [x] **Step 5: Commit and publish**
  Commit the exact changed files, update the existing GitHub branch without force, and let the
  existing draft PR include the new commit.
