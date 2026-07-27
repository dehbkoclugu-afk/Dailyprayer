# 8dp between adjacent targets (roadmap item 22)

Goal: at least 8dp of clear space between neighbouring touch targets, so a
near-miss does not land on the wrong control.

Item 21 made every target 48dp, which pushed several of them into each other —
so this item is the other half of the same change, and it was solved by measuring
rather than by reading code.

## Task 1: Measure the gaps

**Files:** `scripts/measure-tap-targets.mjs`

- [x] The tool now reports, per view, both under-sized targets and neighbouring
      pairs closer than 8dp, saying whether the pair is side by side or stacked.

## Task 2: Do not apply the rule blindly

A stacked list row separated by a rule is a standard contiguous pattern —
Material's own lists have no gaps between rows — and forcing 8dp between settings
rows would be worse design, not safer. The measurement treats a rule drawn on the
boundary as the separation, whichever side draws it.

That exemption is deliberately narrow: it needs an actual line on the boundary.
Two stacked links with nothing between them still fail, and did.

## Task 3: Fix what it found

| Where | Pair | Gap |
| --- | --- | --- |
| Today | verse card shuffle ↔ share | 0dp |
| Library | the two filter segments | 0dp |
| Profile | "restart onboarding" ↔ "delete all my data" | 0dp |
| Text source | the two links in each edition card | 0dp |

- [x] The Profile pair mattered most: one resets a name, the other erases a
      journal, and they were a near-miss apart.
- [x] The library filters are a segmented control, where contiguity is a normal
      pattern — but there was no rule between the halves either, so they got a
      real gap rather than an exemption.

## Task 4: The measurement was wrong twice, and said so

- [x] **Dividers were only detected as a bottom border.** `ValueRow` draws its
      rule as `borderTopWidth` on the row below, so six Profile rows were reported
      as violations when they are the exempt pattern. The detector now accepts a
      rule from either side of the boundary.

- [x] **Controls behind an open sheet were being compared.** With the verse sheet
      open, the reader's "previous chapter" button was flagged as 1dp from a
      highlight swatch — but the modal covers it, so the two are never tappable at
      once. Measurement is now scoped to the topmost fixed-position layer.

- [x] **A sheet that never opened looked like a pass.** The first attempt to
      measure the verse action sheet reported 6 targets — the same as the reader
      behind it — because the click missed. Verse rows are `<Text onPress>` rather
      than `Pressable`, so they carry no button role and the role-based locator
      could not find one; the locator now goes by text. The report prints the
      target count per view precisely so this failure mode is visible instead of
      silently passing. (The missing button role on verse rows is roadmap item 25.)

## Task 5: Verify

- [x] Coverage went from 9 screens to **11 views**, adding the verse action sheet
      (9 targets: five swatches and four actions) and the reading settings sheet
      (4). Every view: 0 under-sized, 0 tight gaps.
- [x] `npm run typecheck`, `npm run lint`, `npm test` (105/105),
      `npm run release-check`, Android Expo export.

## Left open

- The measurement only opens two sheets. The data-deletion, option and reminder
  sheets are still unmeasured; each needs a prepare step.
- Gaps are measured at one viewport (420×900). A narrow phone could bring
  side-by-side controls closer; worth a second width if the layout ever grows more
  horizontal clusters.
