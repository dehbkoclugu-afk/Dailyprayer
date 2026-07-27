# 48dp touch targets (roadmap item 21)

Goal: no touch target below Material's 48×48 dp minimum.

## Task 1: One number

**Files:** `src/theme/tokens.ts`

- [x] `TAP_MIN = 48`. iOS asks for 44 and Material for 48; using 48 everywhere
      rather than branching per platform means the larger target is never wrong and
      there is one number to remember.
- [x] The token's comment states the rule that matters: **`hitSlop` does not
      count.** It extends the touchable region but leaves the visible control
      small, so the thing you can see and the thing you can hit are different
      sizes — which is what makes small controls feel unreliable.

## Task 2: Raise what declared a size

- [x] The 44×44 icon buttons the roadmap names — reader (×2), search, devotional —
      plus library, both plan screens and VerseCard's shuffle/share.
- [x] The 40×40 highlight swatches and their clear button in the verse sheet.
- [x] The search field (44 tall) and the reader's chapter-picker trigger (44),
      both real interactive surfaces.
- [x] Icon buttons that had **no size at all** and leaned on `hitSlop`: library's
      remove, the reader picker's back chevron, search's clear, journal's delete,
      pray's "show all".
- [x] Pray's category chips (`minHeight: 44`).
- [x] Scattered literal `48`s converted to the token, so the rule stays findable.

## Task 3: Guard the declared sizes

**Files:** `src/theme/tapTargets.test.ts`

- [x] Parses the opening tag of every `<Pressable>` and fails on any declared
      `width`/`height`/`minWidth`/`minHeight` below `TAP_MIN`; requires the token
      rather than a literal 48; and fails a Pressable that uses `hitSlop` with no
      size of its own. Nested `shadowOffset` dimensions are stripped first — they
      say nothing about the target and were the guard's first false positive.
- [x] Decorative Views inside a large pressable row are deliberately out of scope:
      the row is the target, not the badge drawn in it.
- [x] **Proved it fails:** shrank a target to 44 (caught), reintroduced a
      hitSlop-only icon button (caught), lowered the token to 44 (caught).

## Task 4: The source scan was not enough

A declared-size check cannot see a control whose height comes out of padding and
line height. `scripts/measure-tap-targets.mjs` walks nine screens of the built web
app in a real browser and measures everything with a button/link/switch role.

That found five more, none of which declared anything too small:

| Control | Rendered |
| --- | --- |
| Reader chapter navigation (prev/next) | 180×**43** |
| Bible tab quick actions (search, library) | 180×**46** |
| Library filter tabs (bookmarks, highlights) | 181×**35** |
| Today's sleep-unlock chip | 49×**37** |

All were given an explicit `minHeight: TAP_MIN`. The measurement now reports zero
under-sized controls across all nine screens.

It needs a browser, so it is a developer tool rather than a CI gate — the same
arrangement as `scripture-drift`:

```
npx expo export --platform web
npm run tap-targets
```

## Task 5: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (105/105),
      `npm run release-check`, `npm run tap-targets` (0 under 48 on 9 screens),
      Android Expo export.

## A correction to item 17

`expo prebuild`, run while verifying the native time picker, silently rewrote the
`android` and `ios` npm scripts from `expo start --android` to `expo run:android`,
and that went into commit `c7db082` unnoticed. `android/` is gitignored and only CI
builds it, so the dev-server scripts are the right ones for this repo. Restored.

## Left open

- Items 41, 42 and 44 asked for these same controls to be 48dp, which this sweep
  does. What remains of them is not size: a *visible* target area for the search
  clear button, focus-scrolling the selected prayer chip into view, and a tonal
  background on the journal delete so it reads as destructive.
- The measurement covers nine top-level screens. Modal sheets are only measured
  where a screen opens one by default; the verse action sheet and the data-deletion
  sheets are not yet walked.
