# Give the journal delete icon a visible target (roadmap item 44)

Goal: the per-entry delete icon should look like a destructive control, not
just be tappable at the right size.

## Task 1: What was already there

**Files:** `app/(tabs)/journal.tsx`

The 48dp box (`width/height: TAP_MIN`) already existed. The icon itself was
an 18px `trash-outline` in `t.inkFaint` on a fully transparent background —
correctly sized, invisible as anything but decoration.

## Task 2: A tonal background, without inventing a color

- [x] `backgroundColor: `${t.danger}26`` — the existing `danger` token with
      a hex alpha suffix (`26` ≈ 15% opacity), not a new named color. No
      `dangerSoft` token exists in `src/theme/tokens.ts`, and picking exact
      new hex values for one (like the Dawn-theme gold-on-goldSoft contrast
      gap from item 32) is a design decision this session doesn't make
      unilaterally — an alpha variant of an already-approved color is the
      mechanically-justified slice instead.
- [x] `borderRadius: TAP_MIN / 2` — a full circle at this box size.
- [x] The glyph itself recolored to `t.danger` too — the item asks the
      background to "carry both tap-ability and destructive meaning";
      matching the icon to it reinforces the second half rather than
      relying on the tint alone.
- [x] Added a pressed-state dim (`opacity: pressed ? 0.7 : 1`) while in
      there — every other Pressable in this file besides item 43's target
      had one; this was the second without one.

## Task 3: Guard it

**Files:** `src/a11y/journalDeleteTarget.test.ts` (new)

- [x] Checks the 48dp box survived, the tint background and border-radius
      are present, and the icon color matches.
- [x] **Proved it fails**, two injections, each reverted before the next:
      1. Reverted the background/border-radius and the icon color together
         → caught.
      2. Kept everything else, removed only `borderRadius` → caught.

## Task 4: Verify

- [x] `npm test` (167/167), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check: created a real entry through the live composer (typed
      text, tapped Save — seeding `localStorage` directly races Zustand's
      async rehydration, the item-38 finding, so this avoids that
      entirely), then measured the delete button: `48×48px`,
      `border-radius: 24px`, `background-color: rgba(176, 73, 47, 0.15)` —
      the Dawn theme's `danger` value at the expected opacity. Rebuilt with
      the fix reverted to confirm the check is meaningful: same 48×48 box,
      `background-color: rgba(0, 0, 0, 0)` (fully transparent) — correctly
      failing.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
