# Bind one text role to the central type (roadmap item 31, partial)

Goal, as written: resolve the app's scattered `fontSize` literals
(10/11/12/14/16/18/20/21/24/27/30/34/46/64) into the semantic
display/title/body/label roles already defined in `src/theme/typography.ts`.

## Why this is marked partial, not done

The literal scope is 160 `fontSize` occurrences across the app. Measured before
touching anything:

```
grep -rn "fontSize:\s*[0-9]" app src --include=*.tsx | wc -l   →  160
grep -rln "\bty\.(display|title|...)\b" app src --include=*.tsx | wc -l  →  11 files already do
```

Clustering every occurrence by its exact style fingerprint (size, family,
letter-spacing, transform) turned up several groups sharing a pixel value —
15sp `sans` in Profile, 15sp `sans` in the legal screen, 15sp `sans` in
DataActionSheet — with no evidence they are the *same role* rather than three
different roles that happen to coincide at one size. Forcing them into one
shared token is a design decision (which of 14 raw sizes deserves a name, and
which same-pixel-value texts are actually the same role), and making that call
unsupervised across ~150 sites, with no way to visually verify each one, is the
wrong way to spend the item.

What clustering *did* find, unambiguously, was one cluster with **zero**
variation: the same four properties, verbatim, in five different files.

## Task 1: The one clean case

**Files:** `src/theme/typography.ts`

- [x] `fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', fontFamily:
      fonts.sansSemiBold` — the small-caps label above a hero title ("VERSE OF
      THE DAY", "CONTINUE READING", "CHAPTER 23") — appeared identically in
      `VerseCard.tsx`, `read.tsx`, `today.tsx` (twice), and `bible.tsx`. Nothing
      kept the five in sync; the next edit to any one of them could drift.
- [x] Added as `type.overline`. Colour is deliberately excluded from the role —
      every call site tints it to its own art or surface (`t.gold`,
      `rgba(217,164,65,0.85)`, `rgba(217,164,65,0.9)`), only the shape is shared.
- [x] Checked for near-misses before assuming they were the same role: a couple
      of other small-caps labels elsewhere (`VerseActionSheet`'s swatch header,
      the devotional's eyebrow) use a *different* size and letter-spacing. Left
      alone — no evidence that's drift rather than a deliberate difference.

## Task 2: Migrate the five sites

- [x] All five now read `style={[ty.overline, { color: ... }]}`, matching the
      array-merge convention the app already uses everywhere else `type` is
      referenced (24 existing call sites checked; the object-spread form was
      not used anywhere, so this keeps the codebase's one convention rather than
      introducing a second).

## Task 3: Guard it

**Files:** `src/theme/typography.test.ts`

- [x] The role's four values match what it replaced (so a later "helpful" edit
      to `type.overline` can't silently redefine what "small caps hero label"
      means).
- [x] No file outside `typography.ts` rebuilds `fontSize: 11` with
      `letterSpacing: 2.5` nearby — the old shape, by name.
- [x] All five known sites use `type.overline`, including both of `today.tsx`'s
      (asserted as exactly 2, not just "at least 1").
- [x] **Proved it fails:** put a raw duplicate back in `read.tsx`, and removed
      one of `today.tsx`'s two migrations. Both caught.

## Task 4: Verify

- [x] `npm test` (136/136), `npm run typecheck`, `npm run lint`, Android export.
- [x] Browser check across `/today`, `/read`, `/bible`: all five overline labels
      render with the same computed `font-size: 11px`, `letter-spacing: 2.5px`,
      `text-transform: uppercase`, each keeping its own distinct colour — zero
      visual change, confirmed by reading the computed styles back rather than
      just trusting the source diff.

## Left open

This is most of the item, not a footnote of it:

- The other ~150 `fontSize` literals were not migrated. Doing that well needs a
  design pass — deciding what new roles the 14 named raw values collapse into,
  and confirming (screen by screen, likely with actual screenshots reviewed by a
  person, not just grep) which same-pixel-value texts are truly the same role
  versus coincidentally equal.
- A reasonable next slice, if this continues: `fontSize: 11` with
  `letterSpacing` values *other* than 2.5 (found: 1.5, 2, 1.4) are candidates for
  either their own named roles or for turning out to be the same role at a
  slightly different, undocumented spacing — worth a design decision either way,
  not a grep-and-replace.
