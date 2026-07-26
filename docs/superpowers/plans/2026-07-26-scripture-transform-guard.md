# No UI or AI flow may transform Scripture (roadmap item 11)

Goal: make sure summarize, simplify, rewrite and auto-translate actions do not
exist on the reader or the sharing surfaces, and cannot be added later without
the build failing.

Two of the six bundled editions make this a licence condition, not only a product
principle: YTC is CC BY-ND 4.0 (no derivative works that change the words or
punctuation) and Bíblia Livre is CC BY 4.0 (any change must be marked).

## Task 1: Audit every surface that touches Scripture

- [x] **Step 1: Check for a service that could transform text**

  Searched `app/` and `src/` for `fetch`, `axios`, `XMLHttpRequest`, `WebSocket`
  and `EventSource`: **none**. There is no runtime HTTP client at all, so no
  summarizing or translating service is reachable. Purchases go through the
  RevenueCat native module, not an HTTP client.

- [x] **Step 2: Audit the verse actions**

  `src/components/VerseActionSheet.tsx` offers four actions — bookmark, copy,
  share, save-to-journal. All four pass `verse.text` through unchanged. The sheet
  truncates the verse for its own preview, which is display only; the actions use
  the full text.

- [x] **Step 3: Audit rendering for silent transformation**

  All 12 `textTransform: 'uppercase'` sites apply to UI chrome (`tr('read.chapter')`,
  `tr('today.verseOfDay')`) or to the reference label — never to a Scripture text
  node. No `toUpperCase` anywhere in the reader, search, library or verse
  components. Search slices text only to build a match preview.

- [x] **Step 4: Audit the journal path**

  A saved verse is stored with its reference and rendered read-only; the only
  affordance is delete. The composer's `TextInput` writes gratitude entries, so a
  user cannot edit stored Scripture.

- [x] **Step 5: Confirm Scripture stays out of the i18n layer**

  `src/i18n/` imports no Scripture data. The reader selects an already bundled
  edition per locale instead of translating one edition into another.

**Audit result: no transforming flow exists.** The work of this item is therefore
to keep it that way.

## Task 2: Bind the audit into a guard

**Files:**
- Add: `src/data/scriptureIntegrity.test.ts`
- Modify: `package.json`

- [x] **Step 1: Write the guard**

  Source-level assertions, blunt on purpose because a transform flow is easy to
  add by accident: no network client, no AI/translation dependency (source and
  `package.json`), no transform vocabulary reaching the interface, an allowlist of
  verse actions rather than a denylist, a verbatim share payload, and no
  re-casing in files that render Scripture.

- [x] **Step 2: Prove the guard fails when it should**

  A guard that cannot fail is worthless, so each class was injected and reverted:
  a `fetch()` call in the reader (caught), a `Summarize` action in the verse sheet
  (caught by both the vocabulary and allowlist checks), a `verse.text.slice()` in
  the share payload (caught), and removal of the credit from each share path
  (caught).

## Task 3: Fix the attribution gap found during the audit

**Files:**
- Modify: `src/components/VerseActionSheet.tsx`, `src/components/VerseCard.tsx`

- [x] **Step 1: Carry the credit out of the app with the text**

  Copy and share sent only the verse and its reference. Both licensed editions
  require the copyright and source information to travel with an extract, and the
  WEB trademark condition requires identifying unchanged text. Both actions now
  send `text + reference + credit`, resolved from the rights registry.

- [x] **Step 2: Make the shared image compliant on its own**

  The daily verse card is shared as a rendered PNG, so a credit in the text
  fallback alone would not cover it. The credit is now rendered on the card under
  the reference, and the text fallback includes it too.

- [x] **Step 3: Lock it down**

  The guard asserts both share paths keep the credit, so removing it fails the
  build.

## Task 4: Verify

- [x] `npm run typecheck`, `EXPO_NO_TELEMETRY=1 npm run lint`, `npm test` (39/39),
      Android Expo export, `npm run release-gate` — all pass.
- [x] No Scripture data file changed: `git status --porcelain` shows no
      `bible-full.*`, verse data or book metadata modification.

## Left open

- The in-reader source screen (version name, licence, full attribution) is
  roadmap item 12; this item only ensures the credit leaves the app with any
  extract.
- Bíblia Livre asks that the version date be cited alongside the credit. The
  credit currently carries the edition and licence but not the date — fold into
  item 12.
- Uppercasing the reference label is safe for Scripture but not for Turkish
  casing (`i`/`İ`); that is roadmap item 33.
