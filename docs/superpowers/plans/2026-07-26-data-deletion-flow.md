# Two-stage data deletion (roadmap item 14)

Goal: restarting onboarding must never take a streak, journal or highlights with
it, and any deletion must show exactly what it will remove before it happens.

## What it looked like before

`app/(tabs)/profile.tsx` had one row, "Restart onboarding", wired straight to
`useUserStore.reset` — **no confirmation of any kind**, so a stray tap cleared the
user's name and quiz answers instantly. There was no way to delete personal data
at all, and nothing anywhere told the user what was stored or what an action
would touch.

The reset itself was already narrow (`onboarded` + `quiz`), so history was not
being lost — but nothing kept it that way, and nothing told the user.

## Task 1: One place that decides what gets touched

**Files:** `src/state/dataReset.ts`, plus `reset()` on eight stores

- [x] **Step 1: Give every store holding history a reset**

  `useJournalStore`, `useHighlightStore`, `useBookmarkStore`, `useStreakStore`,
  `usePlanStore`, `usePrayerStore`, `useBibleStore`, `useReaderStore`. Each one
  declares `reset` in its interface and sets its own initial values, so no caller
  has to know a store's shape.

- [x] **Step 2: Two functions, two guarantees**

  `restartOnboarding()` calls only `useUserStore.reset()`. `deleteAllUserData()`
  resets every history store plus the user store. Neither imports
  `useEntitlementStore`: Plus belongs to the store account and is restored from
  it, so deleting local data must not look like a paid feature being revoked.
  Appearance and language survive too — they are settings, not history, and
  wiping the language mid-cleanup would be hostile.

- [x] **Step 3: Collect counts for the confirmation**

  `collectDataSummary()` reads live counts (journal entries, highlights,
  bookmarks, saved verses, streak and best, plan days, favourite prayers, name,
  whether quiz answers exist) so the sheet can be specific instead of vague.

## Task 2: The two-stage confirmation

**Files:** `src/components/DataActionSheet.tsx`, `app/(tabs)/profile.tsx`

- [x] **Step 1: Stage 1 itemizes both directions**

  "WILL BE DELETED FOREVER" / "WILL BE RESET" with a red mark, then "WILL BE
  KEPT" with a gold check. Zero-count lines are dropped, so the sheet never
  threatens to delete something the user does not have. Counts are snapshotted
  when the sheet opens so they cannot shift mid-decision.

- [x] **Step 2: Stage 2 is a separate deliberate confirmation**

  The primary button advances to stage 2 and only then performs the action; the
  destructive call sits after the stage gate. The button turns danger-coloured at
  stage 2 and the copy changes from a question to a statement.

- [x] **Step 3: Split the two actions in Profile**

  "Restart onboarding" is no longer styled as destructive (it isn't — it keeps
  everything), and a separate "Delete all my data" row sits below it in the danger
  colour. Both open the sheet; neither acts on one tap.

## Task 3: Localize

- [x] 37 keys per locale × 6 languages, including the item labels and the plural
      units used to build lines like "Journal — 12 entries".

## Task 4: Guard it

**Files:** `src/state/dataReset.test.ts`

- [x] **Step 1: Assert the guarantees**

  Restart touches nothing but the user store; the user store's reset stays scoped
  to exactly `onboarded` and `quiz`; delete resets every history store; no path
  reaches the entitlement store; every store `dataReset` calls actually implements
  `reset`; both actions are two-stage with the destructive call after the gate;
  Profile no longer calls `reset` directly.

  These read source text, because `dataReset.ts` and the stores reach `@/` aliases
  and AsyncStorage that the plain Node test runner cannot load. The entitlement
  assertion strips comments first — the module names the store in prose precisely
  to explain why it is excluded.

- [x] **Step 2: Prove the tests fail on regressions**

  Injected and reverted: adding a journal wipe to `restartOnboarding` (caught),
  widening the user store reset (caught), removing the stage gate so delete fires
  from stage 1 (caught), and restoring the one-tap `onPress={reset}` in Profile
  (caught).

## Task 5: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (54/54),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] Rendered both flows from the web export with Playwright, Turkish on the dark
      theme, with seeded data. The delete sheet listed "Journal — 12 entries",
      "Highlighted verses — 3", "Streak — 41 days (best 63)", "Reading plan
      progress — 7 days" and kept Plus and settings. The restart sheet listed only
      the name and quiz answers as reset, with the whole history under "will be
      kept". No page errors.

## Left open

- Item 15 (undo on deleting a single journal entry) is the neighbouring case and
  is still open; `useJournalStore.restore` already exists for it.
- The Privacy Policy says deleting the app removes local data. Now that an
  in-app delete exists, that section could mention it.
