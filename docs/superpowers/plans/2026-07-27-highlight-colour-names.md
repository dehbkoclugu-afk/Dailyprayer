# Name the highlight colours (roadmap item 26)

Goal: a storage key like `gold` must never be read out as if it were a word.

## Task 1: The bug had a shape

`VerseActionSheet`'s swatch label was built as:

```tsx
accessibilityLabel={`${tr('verse.highlight')} ${c}`}
```

`c` is the `HighlightColor` union member — the key the store persists. TalkBack
read "Vurgula gold", "Surligner gold", "Markieren gold": an English word in five
of the six languages, and jargon in the sixth.

## Task 2: A typed map, not a template key

**Files:** `src/theme/highlights.ts`

- [x] Four names in six languages (`highlight.gold` … `highlight.blue`).
- [x] `HIGHLIGHT_LABEL: Record<HighlightColor, TranslationKey>` rather than
      `tr(\`highlight.${c}\` as never)`. The codebase already has one template
      lookup (`player.pace.${pace}`) and it is exactly the construct that hides a
      renamed key until runtime, where it falls back to English. With the map, a
      rename breaks the build.
- [x] `QUICK_HIGHLIGHT` names the `'gold'` the long-press shortcut applies, which
      was a bare literal in the reader.

## Task 3: The colour is read in three places

- [x] **The swatch** — "Highlight, Gold".
- [x] **The verse label** — item 25 announced *that* a verse was highlighted but
      not which colour. Now "Verse 2, highlighted, Blue.".
- [x] **The library list** — the colour stripe down the left edge is the only
      thing telling two highlights apart, and it is drawn, not written; the row
      label was just the reference. Now "Psalms 23:2, highlighted, Blue".
- [x] The long-press shortcut offers no colour choice, so its confirmation says
      which one it used: "Highlighted, Gold".

## Task 4: Something else in the same row

- [x] The library's delete button was labelled `verse.bookmarkRemoved` —
      "Bookmark removed", the past-tense **toast** string, used as the name of the
      button that does the removing. Added `verse.removeBookmark` in six
      languages.

## Task 5: Guard it

**Files:** `src/a11y/labels.test.ts`

- [x] Every colour has a name, and every name is a real translation key.
- [x] No `accessibilityLabel` template interpolates a bare `${c}` / `${color}` —
      the old bug's exact shape.
- [x] The library row carries the colour name, and the delete button does not go
      back to the past-tense toast.
- [x] **Proved it fails:** restored the raw key in the swatch label, deleted a
      colour from the map, reverted the library row to the bare reference, and put
      the toast string back on the delete button. Four injections, four catches.

## Task 6: Verify

- [x] `npm test` (121/121), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views), Android export.
- [x] Read back from the browser in Turkish, French and German across all three
      surfaces:

| Surface | Turkish | French | German |
| --- | --- | --- | --- |
| Swatch | Vurgula, Altın | Surligner, Or | Markieren, Gold |
| Verse | Ayet 2, vurgulu, Mavi | Verset 2, surligné, Bleu | Vers 2, markiert, Blau |
| Library | Mezmurlar 23:2, vurgulu, Mavi | Psaumes 23:2, surligné, Bleu | Psalmen 23:2, markiert, Blau |
| Delete | Yer imini kaldır | Retirer le signet | Lesezeichen entfernen |

Console clean on every run.

## A small decision

The names are capitalised in one form and used in both a standalone label
("Highlight, Gold") and mid-sentence ("highlighted, Blue"). Mid-sentence
capitalisation is technically off in Turkish and French — but a screen reader
pronounces both identically, nothing renders the string visually, and a second
lowercase form would mean eight keys instead of four for no audible difference.

## Left open

- Item 27: colour is still the *only* channel on a swatch. Each needs a shape,
  letter or pattern so the picker works without colour vision, not just without
  sight.
- `player.pace.${pace}` is still a template key lookup with `as never`, and so is
  `cat.${p.category}`. Neither is validated by the dictionary guard. The
  `HIGHLIGHT_LABEL` pattern would fit both.
