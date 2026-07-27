# Colour is not a channel on its own (roadmap item 27)

Goal: tell the four highlight colours apart without relying on colour.

Item 26 gave each colour a name, which serves a screen reader. It does nothing
for the reader who *sees* the swatch and cannot distinguish it — four circles
differing only in hue are four identical circles to a red-green colour-blind
reader, and rose-against-gold and green-against-gold are exactly the pairs that
collapse.

## Task 1: A shape per colour

**Files:** `src/theme/highlights.ts`

- [x] `HIGHLIGHT_ICON`: gold ★, rose ♥, green leaf, blue droplet.

## Task 2: The swatch

- [x] Every swatch draws its own shape. The old marker was a checkmark shown only
      on the chosen swatch, so the other three carried nothing but colour.
- [x] Chosen is **filled**, the rest **outline** — a second channel for selection
      on top of the existing ring. This is the one place roadmap item 94 allows
      the Ionicons outline and filled families to mix.

## Task 3: The library had it too

- [x] A rose highlight was separated from a green one by a 6dp colour stripe and
      nothing else. The stripe gave way to the shape, drawn in the same leading
      slot a bookmark row already uses for its icon — so the two tabs look like
      siblings for the first time.

## Task 4: Guard it

- [x] Every colour needs a shape, and the shapes must be **distinct** — a map
      where two colours share an icon passes a naive "has an icon" check and fixes
      nothing.
- [x] The swatch draws it, filled-vs-outline is present, the library row carries
      it, and the colour-only stripe does not come back.
- [x] **Proved it fails:** gave rose the star as well, restored the
      checkmark-on-selected-only swatch, and put the library stripe back. Three
      injections, three catches.

## Task 5: Verify

- [x] `npm test` (122/122), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views), Android export.
- [x] Screenshotted both surfaces in the browser and looked at them, because this
      is the first item in a while whose result is visual rather than announced.

## Left open

- **The tint behind the verse is still colour-only.** A rose-highlighted verse and
  a green one are the same verse to a colour-blind reader. The fix would have to
  put a mark inside flowing Scripture, which runs into item 99's rule that the
  verse text is never broken up — worth designing deliberately rather than
  patching in here. A marker in the margin, outside the text column, is the
  likely answer.
- The four shapes are decorative rather than conventional; nothing about a leaf
  says "green" to someone who has never seen the swatch. They are consistent,
  which is what matters for telling them apart, but a legend would help a first
  encounter.
