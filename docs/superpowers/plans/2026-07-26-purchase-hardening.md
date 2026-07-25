# Purchase Hardening Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Make Lumen’s paywall use real store data and represent unavailable, cancelled, pending, failed, and purchased states truthfully.

**Architecture:** Keep RevenueCat access inside `src/services/purchases.ts`. Extract deterministic package/error mapping into a dependency-free helper so Node’s built-in test runner can verify the money path. Let `app/paywall.tsx` consume a small typed state model and never infer trial or price claims itself.

**Tech Stack:** React Native, Expo 53, TypeScript, RevenueCat 8.12, Node test runner.

## Global Constraints

- Never grant Plus in a production build without an active RevenueCat entitlement.
- Never show fallback prices or trial claims in a production build.
- Preserve the existing development mock only under `__DEV__`.
- Do not modify or transform any Scripture text.
- Add no dependency.

---

### Task 1: Deterministic purchase-state mapping

**Files:**
- Create: `src/services/purchases.logic.ts`
- Create: `src/services/purchases.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `classifyPurchaseError(error): 'cancelled' | 'pending' | 'failed'`
- Produces: `planIdForPackage(packageType, identifier): PlanId | null`

- [x] **Step 1: Write failing tests**
  Test cancelled code `"1"`, pending code `"20"`, generic errors, annual/weekly/lifetime package types, custom identifiers, and unknown packages.
- [x] **Step 2: Run the focused test and verify failure**
  Run `node --experimental-strip-types --test src/services/purchases.test.ts`.
  Expected: fail because `purchases.logic.ts` does not exist.
- [x] **Step 3: Implement the pure mapping helpers**
  Compare RevenueCat’s stable string codes and package type strings without importing React Native.
- [x] **Step 4: Run focused tests**
  Expected: every purchase mapping test passes.
- [x] **Step 5: Add the focused test to `npm test`**
  Append `src/services/purchases.test.ts` to the existing Node test command.

### Task 2: RevenueCat service hardening

**Files:**
- Modify: `src/services/purchases.ts`
- Test: `src/services/purchases.test.ts`

**Interfaces:**
- Produces: `loadPlans(): Promise<PurchaseCatalog>`
- Produces: `purchase(planId): Promise<PurchaseResult>`
- Preserves: `restore()` and `openSubscriptionManagement()`

- [x] **Step 1: Read API keys from Expo public environment variables**
  Use `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
- [x] **Step 2: Gate development fallback**
  Return fallback catalog and mock success only when `__DEV__`; production without configuration returns `unavailable`.
- [x] **Step 3: Map current RevenueCat offering**
  Return only recognized packages and use `product.priceString`, `pricePerMonthString`, and `subscriptionPeriod`.
- [x] **Step 4: Resolve trial eligibility**
  Call `checkTrialOrIntroductoryPriceEligibility` and mark a plan eligible only for RevenueCat status `2`.
- [x] **Step 5: Return explicit purchase states**
  Convert SDK cancellation and payment-pending codes into non-error results; throw no user-facing generic message for cancellation.

### Task 3: Paywall truthful UI states

**Files:**
- Modify: `app/paywall.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `PurchaseCatalog`, `PurchaseResult`
- Produces: loading, unavailable, ready, pending, cancelled, and purchased UI states

- [x] **Step 1: Load catalog on mount**
  Show a centered progress state while RevenueCat resolves offerings.
- [x] **Step 2: Render only returned store plans**
  Select annual when present, otherwise the first plan. Never render production fallback data.
- [x] **Step 3: Show trial copy only when eligible**
  Base CTA and reassurance visibility on `selectedPlan.trialEligible`.
- [x] **Step 4: Handle purchase results**
  Purchased opens thanks; cancelled silently restores the CTA; pending shows a persistent status card; unavailable shows retry.
- [x] **Step 5: Add six-locale UI strings**
  Translate only interface copy. Do not touch Bible JSON or Scripture strings.

### Task 4: Verification and checkpoint

**Files:**
- Modify: `docs/design-100.md`

**Interfaces:**
- Consumes: completed implementation and test evidence
- Produces: items 1–5 marked complete with commit evidence

- [x] **Step 1: Run `npm test`**
  Expected: all existing and new tests pass.
- [x] **Step 2: Run `npm run typecheck` and `npm run lint`**
  Expected: zero errors.
- [x] **Step 3: Run Android export**
  Run `EXPO_NO_TELEMETRY=1 npx expo export --platform android`.
  Expected: bundle completes.
- [x] **Step 4: Update the design backlog**
  Mark completed items 1–5 in place so the 100-item numbering remains stable.
- [x] **Step 5: Commit and publish**
  Commit exact changed files and update the existing GitHub branch without force.
