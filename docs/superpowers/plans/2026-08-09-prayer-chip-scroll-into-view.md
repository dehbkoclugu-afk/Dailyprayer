# Scroll the selected prayer-category chip into view (roadmap item 42)

Goal: the horizontal category-chip row should keep the selected chip visible,
not just tall enough to tap.

## Task 1: The height half was already done

`app/(tabs)/pray.tsx`'s chips already declared `minHeight: TAP_MIN` (48dp) —
confirmed via `npm run tap-targets`'s "Pray" measurement (23 targets, 0 under
48dp) both before and after this change. Nothing to do there; the item's
other half — auto-scrolling the selected chip into view — was the real gap.

## Task 2: Six chips don't fit

**Files:** `src/data/prayers.ts` (read, not modified)

`prayerCategories` has six entries (morning, anxiety, gratitude, sleep,
family, strength). Measured in the browser at a 390px-wide viewport: the last
chip ("Strength") sits at `x: 582`, entirely past the right edge. Selecting
it — or any category arriving pre-selected — left it clipped by the screen
edge with nothing on screen to confirm it was the active one without
scrolling manually.

## Task 3: Scroll to the minimum, not to center

**Files:** `app/(tabs)/pray.tsx`

- [x] Each chip's own `onLayout` records its `x`/`width` into a ref map keyed
      by category — cheap, and avoids re-measuring on every render.
- [x] The `ScrollView`'s own `onLayout`/`onScroll` track the current viewport
      width and scroll offset the same way.
- [x] A `useEffect` on `[cat, reduceMotion]`: when `cat` is a real category
      (not `'all'`, which has no chip lit up) and its chip's left edge is
      left of the visible window or its right edge is past it, `scrollTo`
      the minimum offset that brings it fully into view — not centered, not
      scrolled unconditionally on every selection.
- [x] `useReducedMotion()` (the hook items 36/37 already added elsewhere)
      turns the scroll's own animation off when the OS asks for it.

## Task 4: Guard it

**Files:** `src/a11y/chipScrollIntoView.test.ts` (new)

- [x] Checks the ref/layout tracking exists on both the row and its chips,
      the effect exists with the reduced-motion-aware `scrollTo` call, and
      that the two bounds checks (left edge, right edge) are both present —
      not a bare unconditional `scrollTo`.
- [x] **Proved it fails**, four injections, each reverted before the next:
      1. Removed the `ScrollView`'s `onLayout`/`onScroll` → caught.
      2. Removed each chip's `onLayout` → caught.
      3. Hardcoded `animated: true`, dropping the reduced-motion check →
         caught.
      4. Replaced the two-bounds-check target calculation with an
         unconditional `chip.x - spacing.xl` → caught.

## Task 5: Verify

- [x] `npm test` (165/165), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] Android `expo export --platform android` — clean, `.hbc` bundle
      produced.
- [x] **Browser check, and a real gotcha in how to write one.** A first
      Playwright script used `.click()` on the target chip and reported the
      fix working — but it also reported the *unfixed* build (the `scrollTo`
      call commented out) as working, which meant the check wasn't testing
      what it claimed to. The cause: Playwright's own `.click()` scrolls its
      target into view before clicking, as part of its actionability
      checks — completely independent of the app's own code. Rewrote the
      check to dispatch the click via `elementHandle.evaluate(el =>
      el.click())`, a raw DOM call that bypasses Playwright's
      scroll-into-view step. With that fix: the unfixed build leaves
      "Strength" at `x: 582` in a 390px viewport (unchanged, off-screen)
      after the click; the fixed build moves it to `x: 254`, fully visible.
      Re-selecting "Morning" (the first chip) after scrolling right also
      correctly scrolls back to bring it into view.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
