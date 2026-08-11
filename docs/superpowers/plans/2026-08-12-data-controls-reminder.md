# Data Controls and Native Reminder Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Add a confirmed device-local data wipe and locale-aware native reminder time selection to Profile.

**Architecture:** A small reset service owns the exact Lumen storage boundary and synchronously resets live Zustand data after persistence removal. A pure reminder-time helper converts between `HH:mm`, `Date`, and localized display text; Profile remains the only UI integration point.

**Tech Stack:** Expo 53, React Native, Zustand, AsyncStorage, expo-notifications, @react-native-community/datetimepicker, TypeScript, Node test runner

## Global Constraints

- Never clear unknown AsyncStorage keys or downloaded Scripture/application-content packs.
- Never imply that local deletion cancels an App Store or Google Play subscription.
- Add no English fallback for destructive copy; all 38 advertised UI locales must remain complete.
- Do not modify Scripture JSON or generated Scripture content.

---

### Task 1: Reminder time boundary

**Files:**
- Create: `src/lib/reminderTime.ts`
- Create: `src/lib/reminderTime.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `parseReminderTime(value: string | null): Date`
- Produces: `formatReminderTime(date: Date): string` and `displayReminderTime(value: string, locale: string): string`

- [x] **Step 1: Write tests for valid/invalid stored times, zero padding, and 12/24-hour locale output.**
- [x] **Step 2: Run the focused Node test and verify it fails before the helper exists.**
- [x] **Step 3: Implement strict local-time parsing and formatting with built-in Date/Intl APIs.**
- [x] **Step 4: Add the focused test to `npm test` and verify it passes.**
- [x] **Step 5: Commit the helper and test as an independently useful checkpoint.**

### Task 2: Exact local-data reset

**Files:**
- Create: `src/services/localData.ts`
- Modify: `src/services/notifications.ts`

**Interfaces:**
- Consumes: `clearLocalUserData(): Promise<void>`
- Produces: removal of exact user-state keys, player-position keys, scheduled reminders, and corresponding in-memory store values while preserving entitlement cache

- [x] **Step 1: Define the explicit persisted-key set and player-key prefix; do not use `AsyncStorage.clear()`.**
- [x] **Step 2: Remove matching keys with `multiRemove` and cancel both reminder identifiers.**
- [x] **Step 3: Reset each live Zustand data field with partial `setState`, preserving store methods.**
- [x] **Step 4: Run typecheck and lint.**
- [x] **Step 5: Commit the reset boundary.**

### Task 3: Complete 38-locale destructive copy

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/locales/*.ts`

**Interfaces:**
- Produces: `profile.deleteData`, `profile.deleteDataMessage`, `profile.deleteDataConfirm`, `profile.deleteDataError`

- [x] **Step 1: Add concise, natural translations to every advertised locale.**
- [x] **Step 2: Run `npm run ui-locales:verify:production`; expect exact parity.**
- [x] **Step 3: Run typecheck and targeted lint.**
- [x] **Step 4: Commit the locale-complete copy.**

### Task 4: Profile controls

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `clearLocalUserData`, reminder time helpers, and native DateTimePicker
- Produces: confirmed destructive row, Android native time dialog, iOS inline time picker, and localized displayed time

- [x] **Step 1: Install the Expo-compatible datetimepicker package.**
- [x] **Step 2: Replace preset reminder alerts with platform-native time selection while preserving disable and permission paths.**
- [x] **Step 3: Add the destructive Profile row and confirmation; route to onboarding only after successful deletion.**
- [x] **Step 4: Verify 48/52 dp targets and accessible button labels.**
- [x] **Step 5: Run all local checks and Android export.**

### Task 5: Publish and verify

**Files:**
- Modify: `docs/design-100.md`

**Interfaces:**
- Produces: merged PR and signed Android artifacts from the updated main branch

- [x] **Step 1: Mark roadmap items 14 and 17 complete only after verification.**
- [x] **Step 2: Confirm protected Scripture files have no diff and run `git diff --check`.**
- [ ] **Step 3: Commit, push through the connected GitHub app, and open a focused PR.**
- [ ] **Step 4: Merge after CI succeeds and verify signed AAB/APK plus emulator smoke.**
