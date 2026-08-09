# Verify a verse announces as one sentence, not nested-Text fragments (roadmap item 47)

Goal: confirm — with something closer to a device test than a source-text
check — that a verse's screen-reader announcement is a single, un-repeated
sentence, not the numeral/first-letter and body read as separate fragments.

## Task 1: The code was already right

**Files:** `app/read.tsx` (read, not modified), `src/a11y/labels.test.ts`
(read, not modified)

Roadmap item 25 already gave every verse an explicit `accessibilityLabel`
(`${tr('read.verse')} ${item[0]}. ${item[1]}`) for exactly the reason this
item names — the visible numeral is a nested `Text`, and without an
explicit label a screen reader would read it as a bare number running into
the first word. `src/a11y/labels.test.ts`'s `'a verse offers its actions
instead of hiding them in a long press'` test already proves the source
declares this correctly, on both verse branches (drop-cap and plain).

What hadn't been checked: whether a real render actually exposes that label
cleanly, or whether the browser's own accessible-name computation
introduces exactly the fragmentation/duplication the item warns about. No
physical TalkBack/VoiceOver device is available in this environment; the
closest available substitute is the rendered accessibility tree of a real
browser build, which is what this item's "device test" clause becomes here.

## Task 2: A permanent browser check, not a one-off

**Files:** `scripts/check-verse-accessibility.mjs` (new)

- [x] Seeds the reader to Psalm 23 (English), navigates to `/read`, and
      reads the first two rendered verses (the drop-cap branch and a plain
      one — the two branches the source-level test already knows to check
      separately).
- [x] For each: parses the `aria-label` into `Verse N. <tail>`, checks the
      verse number doesn't repeat at the start of the tail (the shape a
      bare nested numeral running into the label would produce), checks
      the tail isn't suspiciously short (truncated), and checks no nested
      element inside the verse carries an `aria-label` of its own — which
      is what would give a screen reader two names to read instead of one.
- [x] Follows the same "developer tool, not a CI gate" arrangement as
      `measure-tap-targets.mjs` and the Scripture drift check — it needs a
      browser. Added as `npm run verse-a11y`.

## Task 3: Prove it actually catches something

- [x] Removed the `accessibilityLabel` entirely → the check correctly
      found zero matching elements and failed (no aria-label at all,
      so a browser's default accessible-name algorithm would fall back to
      reading the nested numeral and body as separate fragments — the
      literal bug this item describes).
- [x] Restored the label, then injected a subtler defect: replaced the
      verse text half of the label with the verse number again
      (`${item[0]}. ${item[0]}`, standing in for a label that got
      truncated/duplicated) → caught by both the repetition check and the
      truncated-tail check, on both verses.
- [x] Restored the original source; re-ran clean — passes.

## Task 4: Verify

- [x] `npm test` (172/172 — unchanged; this item added no unit test, since
      the actual fix already existed and is already guarded by
      `labels.test.ts`), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] `npm run verse-a11y` (new) — passes against the real build:
      - Verse 1: `aria-label: "Verse 1. Yahweh is my shepherd: I shall lack
        nothing."` — clean.
      - Verse 2: `aria-label: "Verse 2. He makes me lie down in green
        pastures. He leads me beside still waters."` vs. the *visible*
        `textContent`, `"2  He makes me lie down..."` — confirming the
        label is doing real work: the visible DOM still carries the bare
        numeral + two spaces from the nested `Text`, and the accessible
        name correctly omits it rather than repeating it.
- [x] Android `expo export --platform android` — clean.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
