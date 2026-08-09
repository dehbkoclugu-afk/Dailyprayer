# Measure real contrast on the art-backed cards (roadmap item 50)

Goal: don't trust a gradient scrim's opacity because it looked fine over
whichever image happened to be open when it was chosen — measure it against
every image it actually has to work over.

## Task 1: Find every card this applies to

`VerseCard`, `RitualCard`, the "Tonight" card (`app/(tabs)/today.tsx`), and
the plan cover card (`app/plan/[id]/index.tsx`) all lay hardcoded light text
over an `<Image>` behind a `LinearGradient` scrim. All four use literal
colors (`#F2EEE6`, `rgba(217,164,65,0.85)`, …), never theme tokens — by
design, per `RitualCard`'s own comment: "the card is a dark warm scene
regardless of the app theme, so the text/icon must be light." One
consequence worth stating plainly: there's no Dawn/Vigil dimension to this
measurement, since these specific colors don't change with the theme at
all — testing under one theme is complete coverage, not a shortcut.

Counted the real surface: 8 distinct `VerseCard` art images (13 verse
themes map onto 8 unique files), 3 `RitualCard` images, 1 `Tonight` image,
5 plan-cover images (one plan, `peace-7`, reuses `A13-plan-cover` rather
than its own `A13-peace7` — an asset-selection detail, not a contrast bug,
left alone).

## Task 2: A real measurement, not a re-reading of the source

**Files:** `scripts/check-card-contrast.mjs` (new), `pngjs` (new
devDependency)

- [x] For each card, finds the real `<img>` by its bundled filename and
      walks up to its container — one structural fact holds across all
      four components (confirmed by inspecting the actual rendered DOM,
      not assumed): react-native-web's own `<Image>` wraps itself in an
      *extra* absolutely-positioned div of its own (a `background-image`
      div plus the literal `<img>` tag), so the gradient/text siblings
      this script wants sit two levels up from the `<img>`, not one — the
      first version of this script got zero results everywhere until that
      was found by inspecting a real `outerHTML` dump.
- [x] Scans every leaf text node inside that container, gets its true
      bounding box from Playwright (no manual flexbox math), and measures
      the WCAG contrast ratio of its `color` against what's actually behind
      it — sampled at five points (four corners + centre, the same
      "worst corner, not the average" idea `measure-tap-targets.mjs` uses
      for gaps) via 1×1px screenshots decoded with `pngjs`.
- [x] One more real fix mid-build: the Tonight card's "Unlock" pill is
      itself a `<button>` with its *own* opaque `backgroundColor` — hiding
      it to sample "what's behind the text" hides that fill too and
      samples the card's dark scrim behind the whole pill instead,
      producing a false 1.03:1 reading. Elements that carry their own
      opaque background are now measured against that background directly
      (composited with the text color first if the text itself is
      semi-transparent), not by hide-and-sample.
- [x] Threshold: 4.5:1 for everything measured. Checked whether the item's
      3:1 "büyük başlık" (large-title) exception applies to anything here,
      against WCAG's own technical definition of large text (≥18pt bold,
      or ≥24pt any weight) rather than an eyeballed "this looks big enough"
      call:
      - `VerseCard` overline 11px, reference 15px, credit 11px, quote 25px
        (serifLight, not bold) — 25px ≈ 18.75pt, under the 24pt regular
        threshold.
      - `RitualCard` title 17px (sansSemiBold), subtitle 14px.
      - Tonight overline 11px, title 21px (serif, regular).
      - Plan title 24px (serif, regular) — the single closest case, at
        exactly 18pt, still under the 24pt bar for a non-bold weight.
      None qualify. 4.5:1 applies everywhere measured; the 3:1 exception
      is real in the item's wording but has no current instance to apply
      to. Added as `npm run card-contrast`, the same "developer tool, not a
      CI gate" arrangement as tap-targets and verse-a11y.

## Task 3: Prove it actually measures something

- [x] Weakened `VerseCard`'s top gradient stop from `rgba(23,16,46,0.55)`
      to `rgba(23,16,46,0.10)` (much less darkening at the top, where the
      overline sits) and re-ran: the `A5-verse-trust` variant's overline
      dropped to **4.15:1**, correctly failing. Restored the original
      value; re-ran three times on the unmodified code with no failures
      (worst case seen: 4.90:1 on `A5-verse-joy`'s overline, still with
      real margin over 4.5:1) — the tool isn't passing by construction.

## Task 4: Verify

- [x] `npm test` (178/178 — unchanged; no app source change, since the
      real, unmodified app already passes), `npm run typecheck`,
      `npm run lint`, `npm run release-check`, `npm run tap-targets`
      (13 views, unchanged).
- [x] `npm run card-contrast` — **75 text/background combinations
      measured, all clear 4.5:1.** Full results in the roadmap entry;
      the tightest margins are `VerseCard`'s overline (5.6–6.3:1 across
      the 8 art variants — the smallest text, over the least-darkened
      part of the scrim, is exactly where it should be tightest) and the
      plan cards' taglines (6.15–7.73:1).
- [x] Android `expo export --platform android` — clean.

## Left open

- `peace-7`'s art mismatch (`A13-plan-cover` instead of its own
  `A13-peace7`), noted above — an asset-selection detail outside this
  item's scope.
- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32,
  theme-token colors, unrelated to these hardcoded-color art cards) and
  the `useStreakStore`/`tickToday()` Zustand hydration race (item 38)
  remain unresolved and out of this item's scope.
