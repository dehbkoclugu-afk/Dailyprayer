# Uppercase the Turkish way, not the platform's way (roadmap item 33)

Goal: for Turkish's `i`/`İ` exception, use a correctly-cased translated form
instead of relying on render-time `textTransform`.

## Task 1: Confirm the platform actually gets this wrong

`textTransform: 'uppercase'` is implemented natively, and neither platform's
implementation is what the item worries about for the right reason on its own:

- **iOS** (`RCTTextAttributes.mm`): `[text uppercaseString]`. Apple's own docs
  say this mapping is not localized — it always uses the same
  language-independent rule, regardless of device or app language.
- **Android** (`TextTransform.kt`): `uppercase(Locale.getDefault())` — this
  *is* locale-aware, but tied to the **device's** system locale, not this app's
  own in-app language setting. A user running an English phone with the app set
  to Turkish still gets the wrong casing.

Verified directly: `'nisan'.toUpperCase()` → `'NISAN'` (wrong);
`'nisan'.toLocaleUpperCase('tr')` → `'NİSAN'` (correct). The app already relies
on `Intl` elsewhere (`Intl.DateTimeFormat` in `paywall.tsx` and
`src/lib/time.ts`), so the runtime's locale-aware string APIs are known-good on
this project's Hermes/RN 0.79.6.

## Task 2: A concrete, currently-live instance

Today's date line renders its month name in caps via `type.overline`. April's
Turkish name, "Nisan", contains the one letter this matters for. Verified in a
browser with the clock fixed to April 9: the old code path (plain uppercase)
would have rendered "NISAN"; the fix renders "9 NİSAN PERŞEMBE".

## Task 3: One small, dependency-free helper

**Files:** `src/lib/text.ts`

- [x] `localeUpper(text, locale)` — `text.toLocaleUpperCase(locale)`, with the
      reasoning above as its doc comment.
- [x] Deliberately not in `src/i18n/index.ts`, even though that's where it's
      consumed: that module imports `expo-localization` and the Zustand user
      store, neither of which resolve under the plain Node test runner this
      project's guard tests run on. Kept alongside `src/data/planReadings.logic.ts`
      as a second "pure logic split out so it's testable" file.
- [x] Exposed from `useT()` as `up`, alongside the existing `t` and `tn`.

## Task 4: Every uppercase-transformed render site

Found exactly seven files with `textTransform: 'uppercase'` — five reaching it
through `type.overline` (item 31's role), two with their own inline style:

| File | Content |
| --- | --- |
| `VerseCard.tsx` | "Verse of the day" |
| `read.tsx` | chapter label |
| `today.tsx` (×2) | date line, "sleep prayer" |
| `bible.tsx` | "continue reading" |
| `plan/[id]/[day].tsx` (×2) | plan title + day label, "today's reading" |
| `devotional.tsx` | devotional label |
| `journal.tsx` (×2) | gratitude tag, verse reference |
| `OptionSheet.tsx` | the sheet's `title` prop |
| `VerseActionSheet.tsx` | the verse reference |

- [x] All twelve now wrap their interpolated content in `up(...)`.
- [x] `OptionSheet` calls `useT()` itself rather than expecting every future
      caller to pre-case its `title` prop — one call site, both current users
      (Profile's appearance and language sheets) covered automatically, and any
      future one too.
- [x] The `textTransform: 'uppercase'` styles were **not removed**. Uppercasing
      an already-correctly-cased Turkish `İ` is a no-op, so the style stays as a
      harmless second pass and nothing needed to change there — only the content
      feeding it.

## Task 5: Guard it

**Files:** `src/i18n/localeCase.test.ts`

- [x] `localeUpper` gets the Turkish exception right, and leaves the other five
      languages' output identical to plain `.toUpperCase()`.
- [x] All twelve known render sites are checked by name for `up(...)`.
- [x] A separate rule cross-checks that every file actually containing
      `textTransform: 'uppercase'` is one of the ones the first rule covers — so
      a new uppercase style added later without a matching `up()` call doesn't
      silently ship the platform's wrong casing.
- [x] **Proved it fails:** reverted the date-line site and the `OptionSheet`
      title site to raw content. Both caught.

## Task 6: Verify

- [x] `npm test` (140/140), `npm run typecheck`, `npm run lint`, Android export.
- [x] Browser check with the clock fixed to April 9, 2026: the date line reads
      "9 NİSAN PERŞEMBE" with the correct dotted İ, and "GÜNÜN AYETİ" (verse of
      the day) also ends correctly.
