# Scripture Integrity Policy

Scripture is the one kind of content in this app that must never be paraphrased,
machine-translated, or written from memory. A wrong verse is not a bug — it is a
breach of trust with the user. These rules are binding for every future change.

## Approved source boundary

- Production scripture may come only from the six source files approved by the
  product owner: YTC, WEB, Reina-Valera 1909, Bíblia Livre (Portuguese), La
  Sainte Bible / Ostervald (French, eBible `fra_fob`), and Luther 1912. The
  Portuguese and French sources were replaced on 2026-07-26 after the previous
  ones failed rights verification.
- Importing a source requires its exact edition name, upstream URL, license
  evidence, retrieval date, and immutable Git blob hash.
- Scripture text, book names, verse labels, headings, and source notes are
  immutable source data. They must never pass through the UI translation
  dictionary or an AI translation/rewrite step.
- Two editions are licensed, not public domain, and must remain verbatim with
  their attribution intact: YTC (CC BY-ND 4.0) and Bíblia Livre (CC BY 4.0).
- A source file may be replaced only by a newly verified verbatim export of the
  same approved edition. Missing text must never be filled from another edition.
- Rights claims live in `src/data/scriptureRights.ts`, never in the bundled JSON
  or in a UI string. The generators write a credit into each JSON, which once let
  an unverified "public domain" claim reach users; the app reads only the
  registry, so a claim must carry evidence. Evidence: `docs/scripture-sources.md`.
- Approval is not verification. Ostervald 1996 and an unidentified Almeida
  revision were approved editions whose rights failed verification, and both had
  to be replaced. `npm run release-gate` fails while any bundled edition's rights
  are unverified — run it before every release.

## 1. Verse text comes from a source, never from a model

- All verses in `src/data/verses.ts` are extracted **verbatim** from the World
  English Bible (WEB, public domain) JSON source, by `scripts/fetch-verses.mjs`.
- The generated file carries a "GENERATED — do not edit by hand" header. To change
  the verse set, edit the **reference list** in the script and re-run it; never
  hand-type verse text into the data file.
- Never ask an LLM to "write" or "recall" a verse. Models paraphrase. Always pull
  from the canonical text file.

## 2. Scripture is NEVER machine-translated

- The 6-language i18n system (`src/i18n/`) localizes **UI chrome only** —
  buttons, labels, section titles. It contains **no scripture**.
- The reader selects the already bundled, established edition for the active
  language. It never translates one edition into another at runtime.
- Machine translation of scripture is prohibited. So is paraphrase.

## 3. Devotionals and prayers are original content, clearly bounded

- `src/data/devotionals.ts` and `src/data/prayers.ts` are original devotional
  writing. They may *reference* and *briefly quote* scripture, but:
  - Any direct quotation must match the WEB text exactly.
  - They are presented as reflections/prayers, never as scripture itself.
- These may be translated for other languages, but by a **human translator or
  reviewed translation**, not unreviewed machine output — devotional tone and
  doctrine both matter.

## 4. Automated guard

`src/data/verses.test.ts` fails the build if the verse file is empty, has blank
text, malformed references, or leftover parsing artifacts. This caught a real
incident where a network-based generator produced an empty file. Run `npm test`.

`src/data/scriptureIntegrity.test.ts` enforces rule 2 and rule 3 above instead of
trusting them to review. It fails if any of these appear:

- a runtime network client (`fetch`, `axios`, `XMLHttpRequest`, `WebSocket`,
  `EventSource`) anywhere under `app/` or `src/` — a summarize, simplify, rewrite
  or machine-translate flow needs a service call, and the Privacy Policy promises
  offline-first behavior;
- an AI or machine-translation dependency, in the source or in `package.json`;
- transform vocabulary reaching the interface (`summarize`, `simplify`,
  `paraphrase`, `rewrite`, `retell`, `modernize`, `translateVerse`, …), so a
  button cannot be labeled with an action that is not allowed;
- a verse action outside the allowlist of bookmark / copy / share / save-to-journal;
- a copy or share payload that alters the verse or drops the edition credit;
- `toUpperCase` in any file that renders Scripture.

`src/data/scriptureRights.test.ts` guards the rights registry, and
`npm run release-gate` blocks a release while any bundled edition's rights are
unverified.

## 5. Release checks for the bundled text

`npm run scripture-check` — offline, runs in CI on every push and in the APK
workflow before building. The manifest table in `docs/scripture-sources.md` is the
authority; the check fails if a bundled edition no longer matches it. That is what
makes "Scripture data is immutable" enforceable: a deliberate change is accepted
only by updating that table in the same commit, with the reason recorded. It also
verifies the canonical 66 books in order, no empty chapter or verse, no parser
leftovers, that every book has a localized name, that each JSON credit agrees with
the rights registry, and that the navigation metadata covers the same canon.

Known versification differences are declared in the script rather than smoothed
over: Luther 1912 follows the Hebrew division, giving German Joel 4 chapters and
Malachi 3 where the other editions have 3 and 4. A *new* divergence fails the
check.

Because editions divide books differently, **never resolve a chapter from another
locale's counts.** `bible-books.json` carries the Turkish counts only; use
`chapterCount(locale, code)` or `getBookMeta(locale)`, both backed by
`bible-chapters.json`, which `scripts/build-bible-chapters.mjs` derives from the
bundled text. Reading plans schedule per locale for this reason
(`planReadings.logic.ts`), and `src/data/planReadings.test.ts` checks every plan
day in every language against the edition the reader actually opens.

`npm run scripture-drift` — needs network, so it is deliberately not in CI; run it
before a release. It re-downloads the upstream artifact and compares verse by
verse. eBible.org states the Turkish YTC is still under review, so its text drifts:
a 4-verse drift was found this way on 2026-07-26 and closed by re-exporting. Only
actively revised editions are watched; the rest are pinned to immutable upstream
blobs.

## Verification done at authoring time

Spot-checked against known WEB text (exact match, including WEB's "Yahweh",
Psalm 23:1 colon, curly quotes): Psalm 46:10, Philippians 4:13, Proverbs 3:5-6,
Psalm 23:1, John 3:16, Isaiah 41:10, Jeremiah 29:11. Full set scanned for
footnote markers, truncation, and empty entries — none found. 296 unique verses.
