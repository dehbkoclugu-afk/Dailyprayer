# Give the "Show all" link a real pressed state (roadmap item 43)

Goal: the prayer library's "Show all" control shouldn't just tap-target
correctly — tapping it should visibly do something.

## Task 1: What was already there, and what wasn't

**Files:** `app/(tabs)/pray.tsx`

The control already had `minHeight: TAP_MIN` (the 48dp row the item asks
for) — that part was done. Its `style` was a plain object, though, not a
function of `pressed`, so it was the one Pressable in this file with zero
visual feedback on tap: every chip and row around it dims to `0.7` or `0.6`
opacity while held; this one stayed at full opacity the entire time. It read
as underlined-looking text you could tap, not a button — which is exactly
what the item names as the problem.

## Task 2: The fix

- [x] `style` is now `({ pressed }) => ({ ... })`, dimming to `0.6` while
      held — the same value the sheet Cancel buttons already use elsewhere
      in this codebase.
- [x] Added `paddingHorizontal: spacing.sm` (with a matching negative
      `marginRight` so the visible text stays where it was) — the tap area
      now extends a little past the bare glyphs instead of stopping exactly
      at the text's edges.
- [x] Focus state was already fine: the app never strips the platform's
      default focus outline (confirmed — no `outlineStyle: 'none'` anywhere
      in the codebase), so keyboard/switch-control focus already gets a
      visible ring for free.

## Task 3: Guard it

**Files:** `src/a11y/pressedFeedback.test.ts` (new)

- [x] Checks the control's `style` is a function of `pressed`, dims to
      `0.6`, and adds the horizontal padding.
- [x] **Proved it fails**, two injections, each reverted before the next:
      1. Reverted the whole style back to the original static object →
         caught.
      2. Kept the function form but dropped only the `opacity` line →
         caught (the padding-only version wasn't enough to pass).

## Task 4: Verify

- [x] `npm test` (166/166), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged —
      padding this small doesn't move the measured box past 48dp either
      way).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check: selected a category so "Show all" renders, held the
      mouse down on it, read `getComputedStyle(el).opacity` before and
      during the press. Fixed build: `1` → `0.6`. Rebuilt with the fix
      reverted to confirm the check is meaningful: unfixed build stayed at
      `1` → `1`, correctly failing.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
