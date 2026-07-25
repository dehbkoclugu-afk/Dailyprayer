# Scripture Integrity Policy

Scripture is the one kind of content in this app that must never be paraphrased,
machine-translated, or written from memory. A wrong verse is not a bug — it is a
breach of trust with the user. These rules are binding for every future change.

## Approved source boundary

- Production scripture may come only from the six source files approved by the
  product owner: WEB, YTC, Reina-Valera 1909, João Ferreira de Almeida,
  Ostervald, and Luther 1912.
- Importing a source requires its exact edition name, upstream URL, license
  evidence, retrieval date, and immutable Git blob hash.
- Scripture text, book names, verse labels, headings, and source notes are
  immutable source data. They must never pass through the UI translation
  dictionary or an AI translation/rewrite step.
- YTC is not public domain. It must remain verbatim with its attribution and
  CC BY-ND 4.0 notice intact.
- A source file may be replaced only by a newly verified verbatim export of the
  same approved edition. Missing text must never be filled from another edition.

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

## Verification done at authoring time

Spot-checked against known WEB text (exact match, including WEB's "Yahweh",
Psalm 23:1 colon, curly quotes): Psalm 46:10, Philippians 4:13, Proverbs 3:5-6,
Psalm 23:1, John 3:16, Isaiah 41:10, Jeremiah 29:11. Full set scanned for
footnote markers, truncation, and empty entries — none found. 296 unique verses.
