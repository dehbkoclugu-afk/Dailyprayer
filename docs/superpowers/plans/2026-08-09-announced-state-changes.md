# Announce visual-only state changes (roadmap item 38)

Goal: ritual completed/undone, plan day finished, and prayer ended should each
reach TalkBack exactly once.

## Task 1: One of the three was already done

Every "completed" action already calls `toast(...)` (verse, devotional,
gratitude, prayer), and `ToastHost` already calls
`AccessibilityInfo.announceForAccessibility` for every toast (built during the
locale-completeness work). So "ritual completed" was already covered. What
the item actually needed was its other half — **undone** — plus two
transitions the item names that had no toast or announcement at all.

## Task 2: Ritual undone

**Files:** `app/(tabs)/today.tsx`

- [x] Tapping an already-done `RitualCard` calls `uncompleteStep(key)` directly
      — no navigation, no completion screen, nothing else in the flow to hang
      an announcement on. It changed the card's own `accessibilityLabel`, which
      is not the same as an explicit announcement: a screen reader doesn't
      necessarily re-read a label just because it changed under an element that
      still has focus.
- [x] A small `undo(key)` wrapper calls `uncompleteStep` and toasts
      `today.undone`, reusing the existing announce-via-toast pipeline instead
      of building a second one.

## Task 3: Plan day finished

**Files:** `app/plan/[id]/[day].tsx`

- [x] `complete()` gave a haptic buzz and called `router.back()` immediately —
      nothing telling a screen-reader user the day was actually marked
      complete before being sent back to the previous screen.
- [x] Added `toast(tr('plan.dayCompletedToast'))`, guarded by the same `!done`
      check as the actual toggle — pressing "Complete today" on an
      already-complete day doesn't announce a completion that didn't happen.

## Task 4: Prayer ended

**Files:** `app/player.tsx`

- [x] Reaching the last line swaps the prev/pause/next row for the Amen
      button — a purely visual cue. The existing per-line announcement
      (`AccessibilityInfo.announceForAccessibility(prayer.script[line])`) reads
      the final line's *text*, but says nothing about the *transition itself*.
- [x] A separate `useEffect` keyed on `[lastLine]` — not `[line]` — announces
      `player.prayerEnded` once when the state is entered, not on every
      re-render while it holds. `tr` is deliberately left out of the dependency
      array (with an `eslint-disable-next-line`, matching an existing pattern
      in `read.tsx`): `useT()` returns a fresh closure every render, and
      including it would turn "once" back into "every render".

## Task 5: Guard it

**Files:** `src/a11y/announcedTransitions.test.ts`

- [x] Each of the three checked by exact source pattern: the undo helper is
      wired to all three ritual cards, the plan-day toast sits inside the same
      `if (!done)` block as the toggle, and the prayer-ended effect is keyed on
      `lastLine` alone.
- [x] **Proved it fails:** reverted `undo` to a bare alias for
      `uncompleteStep`, dropped the toast from `complete()`, and removed the
      `lastLine` effect entirely. Three injections, three catches.

## Task 6: Verify

- [x] `npm test` (152/152), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, Android export.
- [x] Browser check: plan-day completion toast reads "Gün tamamlandı"; a
      gratitude entry completed live in the same session, then undone, shows
      "Geri alındı" and the card's label correctly returns to plain "Şükran";
      the player's Amen button appears exactly when the last line is reached.
      `announceForAccessibility` itself is a no-op on react-native-web (same
      native-only limitation as `accessibilityState`/`accessibilityActions`
      elsewhere this session), so the toast text and UI transitions are what's
      directly observable — the announcement call itself is proven by the
      source guard.

## A real bug found while verifying, not part of this item

Seeding `useStreakStore`'s persisted state (`doneDay`, `doneSteps`) and loading
`/today` produced *reset* values instead of the seeded ones — confirmed by
reading `localStorage` back before and after navigation. The cause:
`app/_layout.tsx` calls `useStreakStore.getState().tickToday()` synchronously
in a mount effect, but Zustand's `persist` middleware rehydrates from
`AsyncStorage` **asynchronously**. If the tick runs before rehydration
resolves, it computes from the store's default (empty) state and writes that
back — racing whatever the real persisted values were about to be.

This isn't web-specific: `AsyncStorage` is asynchronous on native too, and
`_layout.tsx`'s mount effect runs on the same schedule regardless of platform.
Every cold start is a potential race, not just this test harness's.

Out of scope for item 38 — it's a hydration-ordering bug, not a missing
announcement — and worth its own investigation (does this affect other
persisted stores the same way; is `onRehydrateStorage`/a "hydrated" gate the
right fix, or should `tickToday()` itself move to wherever hydration
completes). Recorded here rather than patched in passing.
