# Text source screen (roadmap item 12)

Goal: make the edition, licence and full attribution visible in the reader,
instead of leaving a one-line credit to carry the whole disclosure.

This is a licence requirement for two of the six editions, not only a
transparency nicety: YTC (CC BY-ND 4.0) and Bíblia Livre (CC BY 4.0) both require
the copyright and source information to be available, and Bíblia Livre asks that
the version date be cited.

## Task 1: Give the registry what the screen needs

**Files:** `src/data/scriptureRights.ts`

- [x] **Step 1: Add the version field**

  Publishers date their editions and YTC is revised over time, so the screen
  should not imply a single timeless text. Values are kept language-independent
  (`eBible.org · 2026-07-22`, `Bíblia Livre 2018-02 · eBible.org 2022-03-08`) so
  they read correctly in all six languages without translation.

- [x] **Step 2: Make the conditions translatable**

  `conditions` stays canonical English — it is the record the docs and the release
  gate reason about. A new `conditionsKey` points at the localized copy, so the
  screen can show the conditions in the reader's language. A test asserts the two
  are always both present or both absent, so neither surface can silently empty.

## Task 2: Build the screen

**Files:** `app/source.tsx`, `app/_layout.tsx`

- [x] **Step 1: Render the registry, not a hand-written copy**

  Each edition gets a card: language, rights status (public domain / used under
  licence), edition name, copyright, licence, version, the conditions we follow,
  and the date the rights were last reviewed — plus links to the licence text and
  the publisher's rights notice. Everything comes from `SCRIPTURE_SOURCES`, so the
  screen cannot drift from what the release gate checks.

- [x] **Step 2: Show the active edition first**

  The reader's current edition is on top with a gold border under "You are
  reading"; the other five follow under "Other languages". A reader can see what
  they are reading and what every other language uses.

- [x] **Step 3: Register the route**

  `<Stack.Screen name="source" options={{ presentation: 'card' }} />`, matching how
  `legal` is presented, with the same back-button pattern.

## Task 3: Make it reachable

**Files:** `src/components/ReadingSettingsSheet.tsx`, `app/(tabs)/bible.tsx`

- [x] **Step 1: Add the settings-panel entry**

  A "Text source" row in the reader's settings sheet, 56 dp tall, which closes the
  sheet and pushes `/source`. This is the entry point the roadmap asked for.

- [x] **Step 2: Make the credit itself an entry point**

  The small credit on the Bible tab is now a 48 dp pressable that opens the same
  screen, with a "Text source" affordance under it. The credit stops being the
  whole disclosure and becomes the way in.

## Task 4: Localize

**Files:** `src/i18n/translations.ts`

- [x] **Step 1: Add the screen's strings in all six languages**

  17 keys per locale — the row labels, the status labels, the link labels, the
  intro, and the three edition-condition sentences.

- [x] **Step 2: Assert the translations are real**

  A test requires every key to exist in every locale and to differ from the
  English string, so a missing translation cannot hide behind the English
  fallback. `source.version` is exempted: "Version" is genuinely the same word in
  French and German, and treating that as a missing translation would be wrong.

## Task 5: Verify

- [x] **Step 1: Static checks**

  `npm run typecheck`, `EXPO_NO_TELEMETRY=1 npm run lint`, `npm test` (42/42),
  `npm run release-gate`, Android Expo export — all pass.

- [x] **Step 2: Actually look at the screen**

  Exported the web build, served it with extensionless route rewriting, and
  rendered `/source` with Playwright at 420 px:
  - English / light (dawn) theme: renders correctly, active card highlighted.
  - Turkish / dark (vigil) theme: every label, status and condition in Turkish.
  - No page errors, no failed requests.

  The first pass caught a real gap this way: the labels were translated but the
  condition and version *values* were still English in a Turkish UI, which is what
  prompted `conditionsKey` and the language-independent version strings.

## Left open

- Roadmap item 13 still needs the automated integrity check (upstream drift, and
  the 5 ranged verse ids skipped in the WEB source).
- The reader itself (`app/read.tsx`) shows no inline credit; the source screen is
  reached from its settings panel. If an at-chapter-end credit is wanted later, it
  should read `getBibleCredit` like every other surface.
