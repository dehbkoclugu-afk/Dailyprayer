# A verse should offer its actions (roadmap item 25)

Goal: a screen-reader user should not have to discover that long-pressing a verse
highlights it.

## Task 1: What a verse announced

A verse row is a `<Text>` with `onPress` (opens the action sheet) and
`onLongPress` (highlights in place). TalkBack read the verse as plain text.
Nothing said either action existed, and nothing said whether the verse was
already highlighted.

## Task 2: Actions, not a button

- [x] `accessibilityActions` puts both in TalkBack's actions menu: "Verse actions"
      and, depending on the current state, "Highlight" / "Remove highlight". The
      `verse.*` labels already existed in all six languages, so they were reused
      rather than duplicated.
- [x] `onAccessibilityAction` handles both. Declaring `activate` takes over the
      standard click action on Android, so the handler covers it explicitly rather
      than relying on `onPress` still firing.

**They stay Text on purpose.** Item 22's note said the missing button role was
item 25's job; item 25's own text is about *actions*, and that turned out to be
the better answer. Scripture is read by swiping verse to verse — hearing "button"
after every verse of every chapter is noise. An occasional action on a text
element belongs in the actions menu.

## Task 3: The label was wrong too

- [x] The verse number is a nested `Text`, so it was read as a bare numeral
      running into the first word. It is named now: "Verse 1. …" (`read.verse`,
      six languages).
- [x] A highlight was only a background tint — nothing for a screen reader. It is
      announced, and **before the verse, not after**: a long verse takes twenty
      seconds to read out, and a trailing "highlighted" buries the one thing the
      listener is checking for. Result: "Verse 2, highlighted. He makes me lie
      down in green pastures…".

## Task 4: Doing it gave no confirmation

- [x] The quick highlight fired haptics and nothing else. Haptics are all a
      sighted user needs — they can see the tint appear. A screen-reader user got
      nothing at all. `announceForAccessibility` now says "Highlighted" /
      "Highlight removed", matching the `verse.bookmarkAdded` pattern already in
      the sheet.

## Task 5: Guard it

**Files:** `src/a11y/labels.test.ts`

- [x] The shared `verseA11y` block must carry a label, name the verse, put the
      highlight state before the text, declare both actions, and label the
      highlight action from the current state.
- [x] **Both verse branches must spread it.** The drop-cap first verse renders
      through a separate return and was the one easy to forget — so the test counts
      the spreads and requires exactly two.
- [x] The confirmation announcement is required by name.
- [x] **Proved it fails:** removed the spread from the drop-cap verse only,
      removed the highlight action, removed the announcement, and flattened the
      label. Four injections, four catches.

## Task 6: Verify

- [x] `npm test` (119/119), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views), Android export.
- [x] Read back from the browser in Turkish and German: "Ayet 2, vurgulu. Beni
      yeşil çayırlarda…" / "Vers 2, markiert. Er weidet mich auf grüner Aue…", with
      the state on the highlighted verse only. Tapping still opens the action
      sheet, and the console is clean.

## A limit worth stating

`accessibilityActions` is **native-only** in this stack, like
`accessibilityState`: react-native-web carries the props through the component but
maps them to no DOM attribute (0 nodes in the rendered page). So the browser
confirms the label, the state and that the touch path still works; the actions
menu itself needs TalkBack on a device, which is in the go-live checklist.

## Left open

- The highlight colour is still not named — "highlighted" does not say gold or
  blue. That is item 26, which also has to fix `VerseActionSheet`'s swatch label:
  it currently reads `${tr('verse.highlight')} ${c}` with `c` the raw colour key,
  so TalkBack says "Highlight gold".
- Item 27 wants each swatch to carry a shape or letter as well as a colour, so
  colour is never the only channel.
