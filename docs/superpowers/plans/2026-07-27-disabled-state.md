# Say why a control is dimmed (roadmap item 24)

Goal: the chapter arrows announce their disabled state and an explanatory label
instead of only dropping their opacity.

## Task 1: Half of it already worked

**Files:** `node_modules/react-native/Libraries/Components/Pressable/Pressable.js`

RN's `Pressable` folds the `disabled` prop into `accessibilityState`:

```js
_accessibilityState = disabled != null ? {..._accessibilityState, disabled} : _accessibilityState;
```

- [x] So `disabled={!enabled}` was already announcing the state — confirmed in the
      browser as `aria-disabled="true"` with `opacity: 0.4`. Adding an explicit
      `accessibilityState={{ disabled }}` next to the prop would have been
      duplication dressed up as a fix.

What was missing is the **reason**. "Previous, button, dimmed" leaves the reader
guessing whether the app is broken or the Bible has ended.

## Task 2: Labels that say where they go, or why they cannot

**Files:** `app/read.tsx`

- [x] Enabled: `Previous chapter, Psalms 22` — it names the destination, and it
      crosses book boundaries correctly (`Psalms 150` → `Proverbs 1`).
- [x] Disabled: `No previous chapter — this is the start of the Bible`.
- [x] The boundary rule was written three times — in `prev()`, in `next()`, and
      again as `hasPrev`/`hasNext` — and the label would have been a fourth. It is
      one `prevPos`/`nextPos` calculation now, and the arrows take the position
      rather than a boolean.

## Task 3: The same defect, twice more

- [x] `ReadingSettingsSheet`'s A−/A+ steppers dim at the font-scale limits and
      said nothing: now `Smaller text, already the smallest size`.
- [x] `player.tsx`'s previous-line button dims on the first line: now
      `No previous line — this is the first line`.

Both were found by writing the general rule rather than by reading the roadmap
item, which named only the chapter arrows.

## Task 4: Guard it

**Files:** `src/a11y/labels.test.ts`

- [x] **A control that dims itself must really be disabled.** Dimming is a promise
      that pressing does nothing; opacity alone does not keep it. `pressed`-based
      dimming is excluded — that is press feedback.
      The rule is not vacuous: four controls in the app dim on a non-press
      condition (paywall restore, player line-back, reader arrows, font steppers)
      and all four are checked.
- [x] **A control dimmed by a limit must branch its label on that limit** — the
      three cases above, by name.
- [x] **Proved it fails:** flattened the nav label (caught), removed the `disabled`
      prop while keeping the dimming (caught by both rules), flattened the player
      label (caught), flattened the stepper label (caught).

## Task 5: Verify

- [x] `npm test` (110/110), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views), Android export.
- [x] Read back from the rendered DOM: mid-Bible (`Psalms 23`, both arrows live),
      `Genesis 1` (prev disabled), `Revelation 22` (next disabled),
      `Psalms 150` (next crosses books), both font-scale limits, the player's first
      line — and German, to check the labels compose in another language.

## What this turned up, which is not item 24

The player's controls read out in **English while the app language was Turkish**.
Measured across the whole dictionary: every non-English locale is missing 21–22 of
English's 323 keys, and `lookup()` falls back to English silently.

The gaps were not cosmetic:

| Surface | Keys | Effect |
| --- | --- | --- |
| Player | 12 | every control and the pace label, in five languages |
| Paywall | 6 | processing, restoring, restore-failure copy |
| Notifications | 4 | the daily reminder arrived in English for everyone |

Fixed in the next commit, with a completeness guard — it is a release-quality bug,
not an accessibility one. See `2026-07-27-locale-completeness.md`.
