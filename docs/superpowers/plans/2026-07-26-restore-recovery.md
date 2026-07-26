# Restore Recovery Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Make a missing purchase restore result persistent, explanatory, retryable, and support-ready.

**Architecture:** Keep restore state in `app/paywall.tsx` and reuse its existing restore function. Read the support address from Expo public configuration; render and launch email only when a real value exists.

**Tech Stack:** React Native, Expo, TypeScript, RevenueCat boundary, Node test runner.

## Global Constraints

- Never hardcode or invent a support address.
- Do not add dependencies or screens.
- Preserve purchase and entitlement behavior.
- Do not modify Scripture data or religious text.

---

### Task 1: Configured support boundary

**Files:**
- Create: `.env.example`
- Modify: `app/paywall.tsx`

**Interfaces:**
- Consumes: `process.env.EXPO_PUBLIC_SUPPORT_EMAIL`
- Produces: `supportEmail: string | undefined`
- Produces: `contactSupport(): Promise<void>`

- [x] **Step 1: Document release configuration**
  Add RevenueCat public key names and `EXPO_PUBLIC_SUPPORT_EMAIL` to `.env.example`
  using non-working example values.
- [x] **Step 2: Implement the minimum email action**
  Import `Linking`, URL-encode a localized subject, and open `mailto:` only when
  the trimmed environment value is non-empty.
- [x] **Step 3: Add failure feedback**
  Catch `Linking.openURL` rejection and show the localized mail error alert.
- [x] **Step 4: Run static verification**
  Run `npm run typecheck` and `EXPO_NO_TELEMETRY=1 npm run lint`; both exit 0.

### Task 2: Persistent missing-restore card

**Files:**
- Modify: `app/paywall.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `restoreStatus === 'missing'`
- Produces: an alert card with account guidance, retry, and conditional support

- [x] **Step 1: Add six-locale interface copy**
  Add explicit title, account guidance, retry, support, email subject, and email
  launch error strings to all six dictionaries.
- [x] **Step 2: Replace the one-line result**
  Render a token-based inline card with alert semantics beneath the restore control.
- [x] **Step 3: Add recovery actions**
  Retry calls `restorePurchase`; support calls `contactSupport` only when configured.
  Every button is at least 48 dp and supports wrapped localized text.
- [x] **Step 4: Run regressions**
  Run `npm test -- --runInBand`; all 17 tests pass.
- [x] **Step 5: Export Android**
  Run `EXPO_NO_TELEMETRY=1 npx expo export --platform android --output-dir .expo-restore-recovery`
  and move the successful output to a fresh `/tmp` directory.

### Task 3: Publish checkpoint

**Files:**
- Modify: `docs/design-100.md`
- Modify: `docs/superpowers/plans/2026-07-26-restore-recovery.md`

**Interfaces:**
- Consumes: verified implementation
- Produces: roadmap status and updated draft PR

- [x] **Step 1: Verify locale and file scope**
  Count every new UI key six times, run `git diff --check`, and confirm Scripture
  paths have no diff.
- [x] **Step 2: Mark item 7 complete**
  Keep numbering stable and mark only item 7 complete.
- [x] **Step 3: Commit exact files**
  Commit the paywall, translations, environment example, roadmap, spec, and plan.
- [x] **Step 4: Publish without force**
  Update `claude/bible-app-monetization-design-n3uiqr` by fast-forward and verify
  draft PR #3 points to the new remote commit.
