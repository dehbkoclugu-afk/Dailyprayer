# Focus follows the sheet (roadmap item 28)

Goal: a bottom sheet takes screen-reader focus when it opens, holds it, and gives
it back when it closes.

All three were missing. A sheet slid up while TalkBack stayed on the control that
opened it — now underneath the sheet — so the sheet had to be found by swiping,
with no announcement that anything had opened at all.

## Task 1: A correction to item 23

`accessibilityViewIsModal` is **iOS-only**. Item 23's note said it "keeps TalkBack
inside the sheet", which is wrong about the platform TalkBack runs on.

- **Android:** RN's `Modal` is a `Dialog` in its own window. TalkBack does not
  traverse out of it, so containment is free.
- **iOS:** there is no second window; the sheet is a sibling view and VoiceOver
  walks straight past it. The prop is what stops that.

- [x] Note corrected, and the prop added to the five sheets that lacked it.

## Task 2: Move focus in

**Files:** `src/a11y/sheetFocus.ts`

- [x] `useSheetTitleFocus(visible)` returns a ref for the title and focuses it
      shortly after open. The delay is not decoration: focusing while the sheet is
      still animating targets an off-screen view and the platform drops it.
- [x] Every title that takes focus is also `accessibilityRole="header"` — landing
      on it is only useful if it announces itself as one.
- [x] Backdrops are hidden from accessibility. They dismiss on tap but have
      nothing to announce, and leaving them focusable puts an unnamed control
      between the reader and the sheet.

## Task 3: The deletion sheet asks twice

- [x] `DataActionSheet` confirms destructive actions in two stages, rewriting its
      own title in place — a different question in the same frame. The hook takes
      a second argument that re-runs it on that transition. A reader who does not
      hear the title re-read is answering the first question.

## Task 4: Give focus back

- [x] `useTriggerFocus(visible)` fires on the true→false edge and returns focus to
      the control that opened the sheet, instead of dropping it at the top of the
      screen. Four triggers: the reader's passage picker and reading settings, and
      Profile's appearance and language rows.
- [x] `ValueRow` and the reader's `iconBtn` helper forward a ref so their callers
      can name the trigger.

## Task 5: The measurement earned its keep

- [x] `findNodeHandle` **throws** on web rather than returning null, so every
      sheet open raised an uncaught exception in the browser harness. Guarded with
      an early return on web, where the browser owns focus anyway.
- [x] The harness had been printing page errors and **ignoring them** — the note
      scrolled past under a row of green ticks. Uncaught page errors now fail the
      run. An exception means the page being measured is not the page that ships.

## Task 6: Guard it

**Files:** `src/a11y/sheetFocus.test.ts` — six rules, plus one that checks the
list of sheets itself. Without that, a sheet that stopped matching `<Modal>` would
pass every rule by never being looked at.

- [x] **Proved it fails:** removed iOS containment from a sheet, removed a sheet's
      focus hook, demoted a focus target from heading, made a backdrop focusable,
      and dropped a trigger's focus return. Five injections, five catches.

## Task 7: Verify

- [x] `npm test` (129/129), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, no page errors),
      Android export.

## Left open

- Focus behaviour itself is verified by construction, not observation: there is no
  accessibility focus on web, so the browser harness cannot watch focus move. What
  it *can* do — and now does — is fail if the code throws. TalkBack and VoiceOver
  runs are in the go-live checklist.
- `OptionSheet`'s backdrop is a `Pressable` wrapping the whole sheet rather than a
  sibling, so it is hidden by having no `onPress` of its own on the inner layer
  rather than by the flag. It passes for a different reason than the others, which
  is worth tidying if a sixth sheet copies it.
