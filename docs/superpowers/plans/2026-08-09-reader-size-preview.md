# Show a live sample paragraph in the reader's font-size sheet (roadmap item 45)

Goal: the two "A" buttons and a percentage say how much bigger the text gets
— not what a real paragraph looks like at that size, where line length and
leading actually show up.

## Task 1: Reuse the reader's own formula, exactly

**Files:** `src/components/ReadingSettingsSheet.tsx`

`app/read.tsx` renders verse text at `fontFamily: fonts.serifLight`,
`fontSize: Math.round(18 * fontScale)`, `lineHeight: Math.round(30 *
fontScale)`. The preview uses the identical formula and font — it has to be
what the reader actually shows, not an approximation the two could drift
apart from.

- [x] Added a bordered card below the size row with a `Text` at that exact
      formula.
- [x] The sample copy is new UI copy, not Scripture — "This is how a page of
      Scripture will look at this size and spacing." (and five more
      locales) — describing the preview rather than being one, so nothing
      here touches the "Scripture text is never paraphrased" constraint.
- [x] The preview is hidden from screen readers
      (`accessibilityElementsHidden` + `importantForAccessibility=
      "no-hide-descendants"`) — a visual demonstration of line wrapping has
      nothing to say to someone who can't see it, and the percentage
      right above it already gives the number.

## Task 2: New translation key, all six locales

**Files:** `src/i18n/translations.ts`

- [x] `read.sizePreview` added next to `read.textSize` in `en`/`tr`/`es`/
      `pt`/`fr`/`de`. `src/i18n/completeness.test.ts` (pre-existing, checks
      every locale defines every key used) passes unchanged.

## Task 3: Guard it

**Files:** `src/theme/readerPreview.test.ts` (new)

- [x] Checks the preview's font/size/leading/copy exist in the sheet, that
      the formula matches `read.tsx`'s own `bodySize`/`bodyLine` constants
      by name (not just "some formula" — the literal one, so a future
      change to the reader's sizing doesn't leave the preview stale), and
      that it's hidden from the accessibility tree.
- [x] **Proved it fails**, three injections, each reverted before the next:
      1. Removed the whole preview block → caught (two tests: the
         existence check, and the a11y-hidden check).
      2. Changed `read.tsx`'s own `bodySize` formula (18 → 19) without
         touching the sheet → caught by the formula-matching test
         specifically, proving it actually reads `read.tsx`'s current
         source rather than a hardcoded copy of the number.
      3. Removed only the two accessibility-hiding props, keeping the rest
         → caught.

## Task 4: Verify

- [x] `npm test` (170/170), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged —
      the preview isn't a tap target).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check: opened the sheet, located the preview by its sample
      copy (deliberately unreachable by role/name since it's
      accessibility-hidden), read `font-size` at the default 100%: `18px`.
      Tapped "Larger text" three times and re-read it: `23px` — matches
      `Math.round(18 * 1.3)`. Rebuilt with the whole preview block removed
      to confirm the check is meaningful: the locator timed out finding the
      sample copy at all, correctly failing rather than false-passing.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
