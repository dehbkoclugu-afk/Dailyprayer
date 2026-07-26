# Undo on journal deletion (roadmap item 15)

Goal: tapping the small trash icon on a journal entry must not be permanent. Offer
the entry back in a transient message instead.

A gratitude note, or a verse someone saved while reading, is exactly the kind of
thing a mis-tap on an 18 px icon should not cost.

## Task 1: Delete, then offer it back

**Files:** `app/(tabs)/journal.tsx`, `src/i18n/translations.ts`

- [x] **Step 1: Capture the whole entry, not its id**

  `deleteEntry(entry: JournalEntry)` keeps the entry in the closure, removes it,
  then shows a toast with an undo action that calls `restore(entry)`. An id would
  not be enough: once removed, it cannot be resolved back to the text, reference
  and timestamp.

- [x] **Step 2: Rely on the store's existing restore**

  `useJournalStore.restore` already filtered by id (so undo cannot duplicate an
  entry) and re-sorted by `createdAt`, which puts the entry back in its original
  position rather than at the top.

- [x] **Step 3: Add the two strings in six languages**

  `journal.deleted` and `journal.undo`.

## Task 2: The bug this uncovered

**Files:** `src/components/ToastHost.tsx`

`useToastStore` already carried `actionLabel` and `action`, and `ToastHost`
already rendered a button for them — but **no caller had ever passed an action**,
so nobody had exercised the path. It did not work:

- [x] **The container swallowed every tap.** The absolutely-positioned wrapper had
  `pointerEvents="none"`, so the undo button rendered and did nothing. Changed to
  `box-none` — the wrapper stays transparent to touches so it cannot block the
  screen underneath, while the bubble inside can receive them. The bubble itself is
  `auto` only when there is an action; a plain confirmation stays `none` and keeps
  the old non-blocking behaviour.

- [x] **2.2 seconds is not long enough to decide.** An actionable toast now lasts
  6 seconds; a plain one is unchanged.

- [x] **The announcement omitted the action.** `announceForAccessibility` now says
  the message *and* the action label, so a screen-reader user is told the deletion
  can be undone rather than only that it happened.

## Task 3: Guard it

**Files:** `src/state/journalUndo.test.ts`

- [x] Seven assertions: the trash icon no longer calls `remove` directly, the whole
      entry is captured, `restore` filters and re-sorts, the container does not
      block touches, only an actionable toast captures them, the actionable timeout
      is at least 4 s, and the announcement includes the action.

## Task 4: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (61/61),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] Full round trip in a browser against the web export, Turkish on the dark
      theme, with three seeded entries: deleting the middle one removed it, the
      toast showed "Girdi silindi · Geri al", pressing undo restored it, and the
      restored entry came back **between** the other two rather than at the top.
      No page errors. This is the path `pointerEvents="none"` had been blocking.

## Left open

- The toast sits at the top of the screen and overlaps the page heading. That is
  the app's established placement for all nine toast call sites, not something
  this change introduced, but "snackbar" conventionally means bottom-anchored and
  an actionable message covering the title reads worse than a passing
  confirmation. Worth deciding as a design question, with the bottom tab bar in
  mind.
- Item 44 covers giving the trash icon a proper 48 dp target; it currently relies
  on `hitSlop`.
