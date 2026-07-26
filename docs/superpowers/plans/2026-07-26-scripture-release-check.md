# Scripture integrity release check (roadmap item 13)

Goal: make "Scripture data is immutable" enforceable. If a bundled edition's hash
changes, CI must stop, and the change must only be accepted by updating the source
document. Also catch upstream drift, since a publisher can revise the text after
our export.

## Task 1: Correct two claims before building on them

- [x] **Step 1: The WEB "missing verses" note was wrong**

  I had recorded that the generator silently drops 5 ranged verse ids from the WEB
  source. Checked properly: all five are in Sirach, one of 20 non-canonical books
  the generator already excludes, and their content is an editorial note ("Verses
  15 and 16 are omitted by the best authorities"), not Scripture. Scoping the scan
  to canonical books shows **zero** ranged verse ids in any of the four USFX
  sources, so no canonical verse is lost. Corrected in `docs/scripture-sources.md`
  and the roadmap.

- [x] **Step 2: `bibleMeta.ts` claimed chapter counts are identical across locales**

  They are not — see Task 3. Comment corrected to state the truth and point at the
  consequence.

## Task 2: Build the offline check

**Files:** `scripts/check-scripture-integrity.mjs`, `package.json`,
`docs/scripture-sources.md`

- [x] **Step 1: Make the source document the authority**

  The manifest table in `docs/scripture-sources.md` is fenced with
  `scripture-manifest` markers and now carries SHA-256, book, chapter and verse
  counts per locale. The check parses that table and compares it with the files, so
  changing Scripture without updating the table fails, and updating both is the
  accepted path. Verse counts make a hash change reviewable: they answer "did we
  lose text?" without diffing 4 MB of JSON.

- [x] **Step 2: Check structure, not only hashes**

  Canonical 66 books in order; no empty chapter or verse; no parser leftovers
  (`<`, entities, escape sequences, stray Strong's numbers); every book has a
  localized name; each JSON credit agrees with the rights registry; the navigation
  metadata covers the same canon.

- [x] **Step 3: Prove it fails when it should**

  Injected and reverted: an edited verse (caught by hash), an emptied chapter
  (caught structurally), editing the manifest instead of the file (caught), and
  drifting the registry credit away from the bundle (caught).

## Task 3: The check found a real divergence

- [x] **Luther 1912 uses the Hebrew versification**

  German has Joel 4 chapters (others 3) and Malachi 3 (others 4). The totals still
  come to 1189, which is why this was never noticed. Consequences:

  - The reader is fine: it takes chapter counts from the loaded edition and clamps
    the index, and the chapter picker lists the loaded edition's chapters.
  - `src/data/planReadings.ts` is not: it schedules from the Turkish counts, so a
    German reader's plan includes Malachi 4 (which clamps back to Malachi 3, a
    repeated day) and never includes German Joel 4.

  Declared in `KNOWN_CHAPTER_DIVERGENCE` so it stays visible and any new
  divergence fails the check.

- [x] **Fixed the plan scheduling**

  `scripts/build-bible-chapters.mjs` derives per-locale chapter counts from the
  bundled text into `src/data/bible-chapters.json` — derived from the text itself,
  so it cannot disagree with what the reader loads. `bibleMeta.chapterCount(locale,
  code)` exposes them and `getBookMeta(locale)` now returns locale-correct counts.

  Scheduling moved into `src/data/planReadings.logic.ts` as a pure function of
  chapter counts, following the repo's existing `*.logic.ts` split, because
  `planReadings.ts` reaches JSON and path aliases that the plain Node test runner
  cannot import. `planReading` caches a layout per locale — sharing one cache is
  what caused the bug.

  `src/data/planReadings.test.ts` asserts, for all six locales × five plans × 365
  days, that every scheduled chapter exists in that edition, plus that the German
  plan reaches Joel 4 and never schedules Malachi 4. Reproducing the old shared
  layout shows it scheduled Malachi 4 on day 285 and never reached German Joel 4,
  so the test fails on the old behaviour.

  Staleness of the derived metadata is caught twice: by the test and by
  `npm run scripture-check`.

## Task 4: Build the drift check

**Files:** `scripts/check-scripture-drift.mjs`

- [x] **Step 1: Watch only what actually moves**

  Five editions are pinned to immutable upstream blobs; the hash check covers them.
  The Turkish YTC is still under review upstream, so it is the one watched edition.
  The script re-downloads the artifact, re-parses it with the same logic as
  `build-bible.mjs`, and compares verse by verse.

- [x] **Step 2: Keep it out of CI**

  It needs network, and a publisher outage must not fail unrelated builds. It is a
  release-time step, added to `docs/go-live-checklist.md`.

- [x] **Step 3: Run it**

  66 books, 31,059 verses compared, no drift — the 2026-07-26 re-export is current.

## Task 5: Wire the gates in

**Files:** `.github/workflows/ci.yml`, `.github/workflows/android-apk.yml`,
`docs/scripture-integrity.md`, `docs/go-live-checklist.md`

- [x] **Step 1: CI on every push**

  `npm run scripture-check` after typecheck/lint/test. Offline and deterministic,
  so it is safe to run everywhere.

- [x] **Step 2: Gate the APK**

  The APK is the release artifact, so both `scripture-check` and `release-gate` run
  before `expo prebuild`. Unverified rights or altered Scripture cannot reach a
  build. The rights gate stays out of per-push CI on purpose: it must block
  releases, not development.

## Task 6: Verify

- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run scripture-check`,
      `npm run release-gate`, `npm run scripture-drift`, Android Expo export — all pass.
- [x] No Scripture data file changed by this item.

## Left open

- `npm run scripture-drift` only watches Turkish. If another publisher starts
  revising, add it to `WATCHED`.
- `bible-books.json` still carries the Turkish chapter counts for the legacy
  `bookMeta` export. Call sites that need a count should use
  `chapterCount(locale, code)` or `getBookMeta(locale)`; the remaining `bookMeta`
  use in the Bible tab only reads codes and names.
