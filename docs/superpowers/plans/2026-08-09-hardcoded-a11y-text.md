# Move every hardcoded English accessibility string to a key (items 34 + 35)

Goal (34): "Verse of the day", "requires Plus", "locked", "day streak" and
similar labels should be consistent across six languages, not hardcoded
English. Goal (35): `ProgressRing` and `StreakFlame` specifically, with proper
translation keys and plural rules rather than English sentence concatenation.

Both items name overlapping components, so they were done together.

## Task 1: Find every one

Swept every `accessibilityLabel={\`...\`}` template literal in the app and
checked each one's *literal* (non-`${}`) segments for English words not
reached through `tr()`/`up()`. Six turned up:

| Site | Hardcoded text |
| --- | --- |
| `VerseCard.tsx` | "Verse of the day" |
| `bible.tsx` | ", requires Plus" |
| `pray.tsx` | " · Plus" (a *different* wording for the same concept) |
| `RitualCard.tsx` | ", locked" |
| `StreakFlame.tsx` | "day streak", ", completed today" |
| `ProgressRing.tsx` | "of ... completed today" |

## Task 2: The easy four

- [x] `VerseCard.tsx`: no new key needed — `today.verseOfDay` already existed
      for the card's own caption and reads just as naturally as a label prefix.
- [x] `bible.tsx` and `pray.tsx`: had worded the same concept two different
      ways. Unified into one key, `a11y.requiresPlus`, rather than translating
      each phrasing separately — a screen reader hearing one consistent,
      grammatical sentence is better than two inconsistent shortened ones.
      "Plus" itself stays untranslated in every locale, matching the existing
      convention (`data.keepPlus` and the "PLUS" badge text do the same) — it's
      the brand name, not a word.
- [x] `RitualCard.tsx`: `a11y.locked`. The `done` branch right next to it was
      already correctly translated — the inconsistency was sitting in the same
      ternary.

## Task 3: `StreakFlame` needed removing, not translating

Its label wasn't a translation gap so much as a **second, conflicting**
announcement. Today's own wrapper `View` already has an
`accessibilityLabel` covering the same badge (count + streak noun); `StreakFlame`,
nested inside it, had its own separate hardcoded-English label with no
`useT()` at all. Translating it in place would have kept two overlapping
announcements instead of fixing the actual defect: one badge should have one
label.

- [x] `StreakFlame` is now `importantForAccessibility="no"` +
      `accessibilityElementsHidden` — purely decorative, since its parent
      already says everything.
- [x] The one piece of information `StreakFlame`'s label had that the parent's
      didn't — whether today's streak step is done (`litToday`) — moved into
      Today's own label, so nothing was lost in the process.

## Task 4: `ProgressRing`

- [x] Had no `useT()` at all. Added `today.completedToday` (shared with
      `StreakFlame`'s qualifier — same three words, same grammatical slot in
      both). Numbers stay as raw digits (`${done}/${total}`), matching the
      `${count} ${tr(key)}` convention every other counted label in the app
      already follows, rather than trying to force one positional
      English-word-order template across six languages' different grammars.

## Task 5: A bug found along the way, not named by either item

Today's streak badge itself — the *wrapper*, not `StreakFlame` — read
`` `${count} ${tr('today.dayStreak')}` ``: a counted noun through the plain
translator, the exact shape already fixed for `bible.days`/`read.results`/
`player.minLeft` ("1 días seguidos") during the locale-completeness pass, just
missed at this one call site.

- [x] Added `today.dayStreak.one` in all six languages; switched to `tn()`.
- [x] `litToday`'s "completed today" folded into the same label at the same
      time, since fixing `StreakFlame`'s removal required moving that
      information here anyway.

## Task 6: Guard it

**Files:** `src/a11y/hardcodedText.test.ts`

- [x] All six known hardcoded strings are gone from the live code (comments
      quoting the old string as history are excluded from the check).
- [x] The new shared keys are actually referenced at each expected site.
- [x] `StreakFlame` carries no `accessibilityLabel` and is properly hidden.
- [x] Today's streak label carries both the count (via `tn`) and the
      completed-today clause, checked as one exact string rather than a loose
      regex.
- [x] **Proved it fails:** reintroduced the hardcoded `VerseCard` string,
      restored `StreakFlame`'s own label, and reverted the streak badge to
      `tr()`. Three injections, three catches — one of them (`VerseCard`) was
      caught by two independent rules, which is fine.
- [x] One self-inflicted false positive along the way: a doc comment in
      `today.tsx` quoted the *old* buggy pattern verbatim
      (``tr('today.dayStreak')``) as explanation, which the existing
      `completeness.test.ts` guard — scanning raw file text, not just code —
      flagged as if it were live. Reworded the comment to describe the shape
      without spelling out the exact banned substring, rather than teaching that
      guard to strip comments for one self-inflicted case.

## Task 7: Verify

- [x] `npm test` (144/144), `npm run typecheck`, `npm run lint`, Android
      export.
- [x] Browser check in Turkish, German and French: the streak badge and
      progress ring localized end-to-end, singular forms correct in German
      ("1 Tag in Folge", not "Tage") and French ("1 jour de suite", not
      "jours"); every locked plan and prayer item on `/bible` and `/pray`
      reading "Plus gerektirir" consistently. Console clean throughout.
