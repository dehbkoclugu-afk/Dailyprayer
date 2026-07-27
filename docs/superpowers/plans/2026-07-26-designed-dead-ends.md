# Designed states for unknown routes and data (roadmap item 19)

Goal: an invalid plan, day or book parameter must not produce a blank dark
screen. Explain what happened and offer a safe way out.

## What was there

The roadmap's description was literal. Both plan screens had:

```tsx
if (!plan) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
```

A full-bleed view in the theme background: no text, no affordance, nothing to say
whether the app was loading, broken, or empty.

Auditing the other parameterised routes turned up three more failure modes, one of
them worse than a blank screen.

## Task 1: The shared state

**Files:** `src/components/NotFoundState.tsx`, `src/i18n/translations.ts`

- [x] Icon, title, explanation, a **named** safe destination (not just "back"),
      and a plain "go back" shown only when `router.canGoBack()` — a deep link
      opened from outside the app has nothing to go back to.
- [x] 16 strings × 6 languages.

## Task 2: Fix each failure mode

- [x] **Unknown plan** (`plan/[id]/index.tsx`, `plan/[id]/[day].tsx`)

  The blank view, replaced with the designed state pointing at the reading plans.

- [x] **A day outside the plan** (`plan/[id]/[day].tsx`)

  `const dayIdx = Number(day) || 0` quietly turned `?day=abc` into day 1, and
  `?day=9999` on a seven-day plan rendered a clamped reading under a "Day 10000"
  heading — silently wrong rather than visibly broken. Now parsed strictly and
  bounded by `plan.days`, with a state that offers the plan overview.

- [x] **An invalid Scripture reference — this one crashed** (`app/read.tsx`)

  `/read?b=abc&c=1` called `setPos(Number('abc'), 1)`, writing **NaN into the
  persisted reader position**. On the next render `Math.min(NaN, 65)` is NaN, so
  `bible[NaN].chapters` threw — and because the position is persisted, the crash
  survived a restart. Three changes: the deep link is only accepted when it names
  a book and chapter this edition actually has (otherwise the saved position is
  left alone), indexing clamps through a finite integer, and if a chapter still
  cannot be resolved the reader shows the designed state instead of throwing.

- [x] **An unknown prayer** (`app/player.tsx`)

  `prayers.find(...) ?? prayers[0]` played a prayer the user did not ask for. The
  screen is now split into a guard component and `PlayerScreen`, so the early
  return does not sit above the hooks.

- [x] **Anything unmatched** (`app/+not-found.tsx`)

  There was no `+not-found` route, so expo-router fell back to its own unstyled,
  English-only unmatched screen.

## Task 3: Guard it

**Files:** `src/components/notFoundState.test.ts`

- [x] Eight assertions: no screen returns the bare background view, every dead end
      has a title, body, named action and safe destination, the day is parsed
      strictly and bounded, the deep link is validated before `setPos`, the reader
      clamps instead of indexing NaN, the player does not substitute a prayer, and
      all 16 strings exist in all six languages and differ from English.
- [x] Assertions run against comment-stripped source: the files quote the old code
      in their comments on purpose, and matching that would make the guards pass
      for the wrong reason.

## Task 4: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test` (101/101),
      `npm run scripture-check`, `npm run release-gate`, Android Expo export.
- [x] Exercised all four cases in a browser against the web export, Turkish on the
      dark theme — `/plan/does-not-exist`, `/plan/peace-7/9999`, `/player?id=nope`
      and `/totally/unknown/path`. Every one rendered its designed state with a
      named action; none was blank; no page errors. The static harness needed an
      SPA fallback to reach dynamic routes at all, which is a property of the
      file server, not the app.

## Left open

- `app/legal.tsx` treats any `doc` value other than `terms` as the privacy policy.
  That is a benign default rather than a dead end, but an explicit unknown-document
  state would be more honest.
- The designed state is reachable but has no illustration; the app has art slots
  for empty states elsewhere (`A12-journal-empty`), so a dedicated piece would fit
  the visual system better than the icon circle.
