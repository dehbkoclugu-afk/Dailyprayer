# Remove fixed heights that clip large text (roadmap item 30)

Goal: at a large system font size, `VerseCard`, the paywall hero, and the app's
other text-on-art cards must grow instead of clipping.

The same defect in three places: a `height` (fixed) combined with
`overflow: 'hidden'`, with text laid over or beside it. At a large system font
size the text needs more room than the box has, and `overflow: 'hidden'` cuts
off whatever does not fit instead of the box growing.

## Task 1: One component, five call sites

**Files:** `src/components/ArtSlot.tsx`

- [x] `ArtSlot` is the single component behind the paywall hero, every plan
      card, the Bible tab's "continue reading" hero, and the Tonight card — it
      was passing its `height` prop straight through as a fixed height. One
      change (`minHeight: height`) fixes all five call sites at once, since none
      of them can drift independently of the shared component.
- [x] The absolutely-positioned background `Image` still fills whatever height
      the box ends up at — `height: '100%'` resolves against the box's actual
      rendered size, not its floor.
- [x] Call sites with no text overlay (decorative logomarks, onboarding art)
      behave identically to before: nothing pushes them past the floor, so they
      render at exactly the specified height.

## Task 2: VerseCard's non-scrolling rows

**Files:** `src/components/VerseCard.tsx`

- [x] The verse text already scrolls in its own `ScrollView`. The label above it
      and the reference/credit/icon-button row below it do not, and at a large
      system font size those two rows alone can approach the card's fixed 320dp.
      `minHeight: 320` in place of `height: 320`.

## Task 3: The streak badge

**Files:** `app/(tabs)/today.tsx`

- [x] Same defect, without `overflow: 'hidden'`: a fixed 64×64 box let a
      three-digit streak spill past its own rounded border at a large font size
      instead of the badge widening. `minWidth`/`minHeight` in place of
      `width`/`height`, plus a little horizontal padding so the number does not
      sit flush against the border when it fills the floor exactly.

## Task 4: Guard it

**Files:** `src/theme/textGrowth.test.ts`

- [x] Three rules, one per fix, each checking the exact source pattern by name —
      matching this session's established style for defects with a specific,
      nameable shape rather than a broad heuristic.
- [x] **Proved it fails:** reverted each of the three files to its old fixed
      `height`/`width` and confirmed the matching rule (and no other) failed.
      Three injections, three catches.

## Task 5: Verify

- [x] `npm test` (133/133), `npm run typecheck`, `npm run lint`, Android export.
- [x] Browser check at a realistic 2× font scale (`font-size` only): the Bible
      tab's hero and five plan cards, and Today's Tonight card, all rendered with
      `min-height` present in their inline style (confirming the fix actually
      took effect, not just compiled) and `scrollHeight === clientHeight`
      everywhere — no clipping.

## A limit worth stating

A separate, more extreme browser check — 3× scale, with `line-height` also
overridden by a blanket CSS selector — produced a runaway box height on one
card. That is not a real accessibility setting on any platform: no OS applies a
blanket `line-height` override to every element including images and layout
`View`s, only to text. The realistic check (font-size only, matching Android's
actual maximum scale) was clean throughout. Native Yoga layout also does not
have the CSS ambiguity this could come from — a percentage-height absolutely
positioned child inside an auto-sized parent is resolved in one pass against the
parent's already-computed size, not the two-pass definite/indefinite
distinction browsers make. Recorded here rather than chased further, since
reproducing it needed CSS no real font-scaling setting produces.

## Left open

- `ArtSlot`'s placeholder branch (rendered when no art is registered for an id)
  was not touched — it has its own `position: absolute, width: 100%, height: 100%`
  box with a short label and spec text, sized the same way as the real image, so
  it inherits the fix without a separate change.
- Item 31 ("bind text roles to a central type system") is a natural next step for
  the same files — several of the `fontSize` literals touched here (11, 14, 15,
  17, 20, 21, 24, 27) are exactly the scattered values that item names.
