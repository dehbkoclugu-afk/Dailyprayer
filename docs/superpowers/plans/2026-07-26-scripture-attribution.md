# Scripture Attribution Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Disclose the exact source and rights status of every bundled Scripture edition without modifying any Scripture content.

**Architecture:** Keep readable rights disclosure in the existing in-app Terms string and its hosted Markdown mirror. Store source provenance and immutable hashes in a separate documentation manifest so release verification can consume it later without exposing audit noise in the UI.

**Tech Stack:** TypeScript string data, React Native legal renderer, Node test runner, Markdown, Git

## Global Constraints

- Never edit, translate, normalize, regenerate, or reformat Scripture text, book names, verse labels, headings, source notes, or any `src/data/bible-full.*.json` file.
- Do not describe YTC as public domain.
- Do not describe the specific Ostervald 1996 revision as independently verified public domain.
- Use only source and license claims supported by the evidence recorded in the design specification.

---

### Task 1: Lock the legal disclosure requirements with tests

**Files:**
- Create: `src/data/legal.test.ts`
- Modify: `package.json`
- Test: `src/data/legal.test.ts`

**Interfaces:**
- Consumes: `TERMS_OF_SERVICE: string`
- Produces: executable assertions for six editions and the two sensitive rights qualifications

- [x] **Step 1: Write the failing test**

  Add:

  ```ts
  import assert from 'node:assert/strict';
  import test from 'node:test';
  import { readFileSync } from 'node:fs';
  import { TERMS_OF_SERVICE } from './legal.ts';

  const editions = [
    'Yorumsuz Türkçe Çeviri',
    'World English Bible',
    'Reina-Valera 1909',
    'João Ferreira de Almeida',
    'Ostervald 1996',
    'Luther Bible 1912',
  ];

  test('Terms disclose all six Scripture editions and sensitive rights limits', () => {
    for (const edition of editions) assert.match(TERMS_OF_SERVICE, new RegExp(edition));
    assert.match(TERMS_OF_SERVICE, /© 2023-2025 İsmail Serinken and eBible\\.org/);
    assert.match(TERMS_OF_SERVICE, /CC BY-ND 4\\.0/);
    assert.match(TERMS_OF_SERVICE, /independent rights verification is pending/);
    assert.doesNotMatch(TERMS_OF_SERVICE, /All Scripture.*public domain/i);
  });

  test('hosted Terms mirror the Scripture disclosure', () => {
    const hosted = readFileSync('docs/legal/terms-of-service.md', 'utf8');
    for (const edition of editions) assert.match(hosted, new RegExp(edition));
  });
  ```

- [x] **Step 2: Run it and verify the expected failure**

  Run `node --experimental-strip-types --test src/data/legal.test.ts`; it must fail because the Terms currently name only World English Bible.

- [x] **Step 3: Add the test to the suite**

  Append `src/data/legal.test.ts` to the existing `test` command in `package.json`.

- [x] **Step 4: Re-run the focused test**

  Run the same focused command and confirm it still fails only on missing disclosure.

### Task 2: Add the six-edition Terms disclosure

**Files:**
- Modify: `src/data/legal.ts`
- Modify: `docs/legal/terms-of-service.md`
- Test: `src/data/legal.test.ts`

**Interfaces:**
- Consumes: verified edition names, rights statements, and source URLs
- Produces: matching readable disclosures in app and hosted Terms

- [x] **Step 1: Replace the single-source service statement**

  State that Selaora bundles six separately sourced editions and refer readers to the new disclosure section.

- [x] **Step 2: Add one bullet per edition**

  Include exact title, supported rights statement, upstream source URL, and any required qualification. Preserve YTC copyright, CC BY-ND 4.0, license URL, verbatim/no-word-or-punctuation-change statement, and the WEB trademark condition.

- [x] **Step 3: Correct acceptable-use wording**

  Separate Selaora's original content restriction from Scripture rights and direct users to the per-edition terms instead of claiming all Scripture is WEB/public domain.

- [x] **Step 4: Mirror the same disclosure**

  Apply the same factual content to `docs/legal/terms-of-service.md` without adding placeholders.

- [x] **Step 5: Run the focused test**

  Run `node --experimental-strip-types --test src/data/legal.test.ts`; both tests must pass.

### Task 3: Record immutable source evidence

**Files:**
- Create: `docs/scripture-sources.md`

**Interfaces:**
- Consumes: upstream URLs and blob SHAs retrieved on 2026-07-26; bundled JSON SHA-256 values
- Produces: six-row audit manifest for later release gates

- [x] **Step 1: Add the five Git-backed source records**

  Record the exact `seven1m/open-bibles` filename, blob URL, Git blob SHA, upstream rights claim, retrieval date, and bundled JSON SHA-256 for WEB, RV1909, Almeida, Ostervald 1996, and Luther 1912.

- [x] **Step 2: Add the official YTC record**

  Record the eBible details and copyright URLs, CC BY-ND 4.0 URL, copyright notice, retrieval date, and bundled JSON SHA-256. Explicitly state that the original downloaded artifact was not retained with an immutable upstream Git blob SHA and must be pinned before release-gate item 13 can pass.

- [x] **Step 3: Record evidence limitations**

  Explain that `seven1m/open-bibles` is the source of the four public-domain labels and that independent verification of the specific Ostervald 1996 revision remains pending under roadmap item 10.

- [x] **Step 4: Check the manifest**

  Run `rg -n "2026-07-26|CC BY-ND 4.0|pending|[0-9a-f]{40}|[0-9a-f]{64}" docs/scripture-sources.md` and verify every record has the applicable evidence.

### Task 4: Complete and verify roadmap item 9

**Files:**
- Modify: `docs/design-100.md`
- Modify: `docs/superpowers/plans/2026-07-26-scripture-attribution.md`
- Test: `src/data/legal.test.ts`

**Interfaces:**
- Consumes: completed disclosure and evidence manifest
- Produces: completed item 9 with item 10 still open

- [x] **Step 1: Mark only item 9 complete**

  Keep numbering stable and leave YTC/Ostervald release verification item 10 open.

- [x] **Step 2: Run all checks**

  Run `npm run typecheck`, `EXPO_NO_TELEMETRY=1 npm run lint`, `npm test -- --runInBand`, and Android Expo export. Every command must exit 0.

- [x] **Step 3: Verify protected scope**

  Run `git status --porcelain` and confirm no Scripture JSON, verse data, book metadata, generator script, or embedded credit file changed. Run `git diff --check`.

- [x] **Step 4: Commit exact files**

  Commit the legal source, hosted mirror, evidence manifest, test, package script, roadmap, specification, and plan with message `Disclose all Scripture sources`.

- [x] **Step 5: Publish without force**

  Fast-forward the existing remote branch, verify draft PR #3 points to the new remote commit, and update its body with the legal disclosure and unchanged-Scripture verification.
