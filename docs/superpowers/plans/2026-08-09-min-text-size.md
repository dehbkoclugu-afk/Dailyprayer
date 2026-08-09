# Raise the smallest readable text (roadmap item 32, partial)

Goal, as written: PLUS badges and helper labels must not stay at 10-11sp;
contrast and font scale should guarantee at least Material's label-small
equivalent.

The item names two criteria — size and contrast. Size is done. Contrast turned
up something real that was not fixed, and the reason why is worth stating
precisely rather than either silently skipping it or silently "fixing" it with
an unreviewed colour choice.

## Task 1: The size floor

- [x] Material's label-small is 11sp. Exactly three `Text`s in the app were
      below it, all at 10sp: Today's locked sleep-prayer "PLUS" badge, Pray's
      locked category row "PLUS" badge, and `ArtSlot`'s placeholder caption
      (dev-only — shown when no art is registered for an id, never in a release
      build, raised anyway since there's no reason to leave it small).
- [x] All three raised to 11.

## Task 2: Guard the floor

**Files:** `src/theme/minTextSize.test.ts`

- [x] One rule: no `fontSize` literal anywhere in `app/` or `src/` is below 11.
      Simple by design — a floor is a floor, not a role, so this doesn't need
      the per-site judgement item 31's guard needed.
- [x] **Proved it fails:** put one badge back at 10sp, confirmed the rule
      caught it, restored it.

## Task 3: What the contrast half of the item found

Computing WCAG contrast (relative luminance, the standard formula) for Pray's
PLUS badge — `t.gold` text on a `t.goldSoft` background — because the item
names contrast explicitly, not just size:

| Theme | Foreground | Background | Ratio | AA (4.5:1, small text) |
| --- | --- | --- | --- | --- |
| Vigil (dark) | `#D9A441` | `#2E2718` | 6.58:1 | pass |
| Dawn (light) | `#B8860B` | `#F5E7C8` | **2.66:1** | **fail** |

The same colour pair — `t.gold` on `t.goldSoft` — is not a one-off: it is also
how `VerseActionSheet`'s highlight/bookmark/copy/share/journal action row marks
its active state. Same failure, same theme.

## Task 4: Why this is not fixed here

`t.onGold` exists specifically for "text that sits on a gold surface" — it
would be the obvious fix if it were simply the wrong token in the wrong place,
the way item 26 found a wrong-key bug. It is not that:

| Theme | `onGold` on `goldSoft` | Ratio |
| --- | --- | --- |
| Dawn | `#FFFFFF` on `#F5E7C8` | **1.22:1** — far worse |
| Vigil | `#1A1206` on `#2E2718` | **1.25:1** — far worse |

`onGold` is calibrated for the *solid* `gold` background it is always paired
with elsewhere (`PillButton`, `library.tsx`'s active segment, the checkmark on
a chosen swatch) — against the much paler `goldSoft`, both its light and dark
variants are close to invisible. Swapping in plain `ink` passes cleanly
(14.06:1 in Dawn) but removes the gold brand accent from what is clearly meant
to read as a *branded* highlighted/selected state, which is a visual-language
choice, not a bug fix.

Genuinely fixing this needs a **new colour** — something that keeps the gold
character of the surface while passing 4.5:1 against it in both themes — which
is exactly the kind of design decision this session has been declining to make
unsupervised (item 27's un-marked verse tint, item 31's remaining 150
`fontSize` literals). Recorded with the exact numbers and locations so it can be
picked up as its own item rather than lost.

## Task 5: Verify

- [x] `npm test` (137/137), `npm run typecheck`, `npm run lint`, Android export.
- [x] Browser check: both PLUS badges render at `font-size: 11px`.

## Left open

- The `t.gold`-on-`t.goldSoft` contrast failure in the Dawn theme, at the two
  locations named above and possibly others sharing the same pair — worth a
  full sweep once a corrected colour exists to sweep *to*.
- Font scale (the item's other named mechanism, alongside contrast): checked —
  `allowFontScaling` does not appear anywhere in the app, so nothing caps a
  `Text` below what the system font size would otherwise render it at. This
  part of the item was already true before touching anything.
