# Multilingual Public-Domain Bible Audio Implementation Plan

> **For agentic workers:** Execute this plan task-by-task. Steps use checkbox syntax.

**Goal:** Add Plus-gated, exact-edition chapter audio for World English Bible, Lutherbibel 1912, Reina-Valera 1909, Louis Segond 1910, and Japanese Freedom Bible 2026 without ever substituting another edition.

**Architecture:** A typed source catalog selects audio by exact Scripture edition identity and delegates chapter resolution to a provider-specific adapter. A shared reader component owns playback and entitlement presentation while adapters own trusted-host validation, deterministic chapter mapping, and in-memory catalog caching.

**Tech Stack:** Expo 53, React Native, TypeScript, expo-audio, node:test, public HTTPS audio catalogs.

## Global Constraints

- Preserve exact Scripture text and edition names; never alter text to fit audio.
- Permit only HTTPS media and metadata URLs on an explicit per-source host allowlist.
- Fail closed when edition, book, chapter, rights evidence, or source coverage cannot be verified.
- Keep audio remote; do not add MP3 files to the application bundle.
- Preserve the existing Plus entitlement and `/paywall?from=bible-audio` behavior.
- Enable only sources whose audio rights and chapter-level endpoints pass the acceptance gate.

---

### Task 1: Introduce the exact-edition audio catalog

**Files:**
- Create: `src/services/scriptureAudio.ts`
- Create: `src/services/scriptureAudio.test.ts`
- Modify: `src/data/scriptureSource.ts`

**Interfaces:**
- Consumes: selected Scripture source metadata, zero-based book index, zero-based chapter index, optional `fetch` implementation.
- Produces: `getScriptureAudioSource(edition: string): ScriptureAudioSource | null` and `resolveScriptureAudioChapterUrl(edition: string, bookIndex: number, chapterIndex: number, fetcher?: typeof fetch): Promise<string>`.

- [ ] **Step 1: Write the failing catalog tests**
  Add tests asserting that `World English Bible`, `Luther 1912`, `Reina-Valera 1909`, `Louis Segond 1910`, and `Japanese Freedom Bible 2026` resolve to distinct source IDs, while `Diodati 1649`, unknown editions, and near-match names return `null`.
- [ ] **Step 2: Run the tests and verify the expected module-not-found failure**
  Run `node --experimental-strip-types --test src/services/scriptureAudio.test.ts`; expect failure because `scriptureAudio.ts` does not exist.
- [ ] **Step 3: Implement the minimum typed catalog**
  Define `ScriptureAudioSource` with `id`, `locale`, `edition`, `label`, `attribution`, `rights`, `evidenceUrl`, `trustedHosts`, `coverage`, and `resolveChapterUrl`. Add exact-string catalog lookup and shared index/HTTPS/trusted-host guards. Export the current edition identity from Scripture source metadata instead of deriving it from application locale.
- [ ] **Step 4: Run focused verification**
  Run `node --experimental-strip-types --test src/services/scriptureAudio.test.ts`; expect all catalog and mismatch tests to pass.
- [ ] **Step 5: Commit**
  Commit the three paths with message `Add exact-edition Scripture audio catalog`.

### Task 2: Move World English Bible behind the shared resolver

**Files:**
- Modify: `src/services/webAudioBible.ts`
- Modify: `src/services/webAudioBible.test.ts`
- Modify: `src/services/scriptureAudio.ts`

**Interfaces:**
- Consumes: World English Bible book and chapter indices.
- Produces: a trusted `https://ebible.org/eng-web/audio/...mp3` URL through the shared resolver.

- [ ] **Step 1: Add a failing shared-resolution test**
  Stub the eBible directory response with two MP3 links and assert `resolveScriptureAudioChapterUrl('World English Bible', 39, 1, fetcher)` returns the second Matthew URL; assert an `evil.example` link is rejected.
- [ ] **Step 2: Run the test and verify the expected missing-adapter failure**
  Run both service test files and expect the shared resolver test to fail before adapter registration.
- [ ] **Step 3: Register the existing WEB adapter**
  Reuse `resolveWebAudioChapterUrl`, export its cache reset through the shared service, and remove no existing host/path validation.
- [ ] **Step 4: Run focused verification**
  Run `node --experimental-strip-types --test src/services/webAudioBible.test.ts src/services/scriptureAudio.test.ts`; expect success.
- [ ] **Step 5: Commit**
  Commit the three paths with message `Route English Bible audio through the catalog`.

### Task 3: Add verified German, Spanish, French, and Japanese adapters

**Files:**
- Create: `src/services/publicDomainAudioProviders.ts`
- Create: `src/services/publicDomainAudioProviders.test.ts`
- Modify: `src/services/scriptureAudio.ts`
- Create: `docs/legal/scripture-audio-sources.md`

**Interfaces:**
- Consumes: provider HTML, XML, JSON metadata, or deterministic directory listings plus canonical book/chapter indices.
- Produces: provider adapters returning exact-edition chapter MP3 URLs only from their declared trusted hosts.

- [ ] **Step 1: Record source evidence and coverage fixtures**
  Document canonical evidence URLs, audio-rights statements, media hosts, expected book count, expected chapter count, and known limitations for Lutherbibel 1912, Reina-Valera 1909, Louis Segond 1910, and Japanese Freedom Bible 2026. Mark an entry disabled if its audio rights or stable chapter endpoint cannot be independently verified.
- [ ] **Step 2: Write failing parser and coverage tests**
  Use small inline provider-response fixtures. Assert deterministic order, rejection of HTTP and foreign hosts, exact first/middle/last chapter mapping, declared coverage totals, and explicit unavailability for every missing chapter.
- [ ] **Step 3: Run tests and verify the expected module-not-found failure**
  Run `node --experimental-strip-types --test src/services/publicDomainAudioProviders.test.ts`; expect failure because the provider module does not exist.
- [ ] **Step 4: Implement the smallest provider adapters**
  Add one adapter per distinct catalog shape. Share only URL allowlist and ordered-link parsing helpers that have at least two callers. Cache successful metadata responses by source and book; do not cache failures.
- [ ] **Step 5: Register only acceptance-gate-passing sources**
  Connect enabled adapters to their exact catalog editions. Keep failed candidates documented but absent from the production source map.
- [ ] **Step 6: Run focused verification**
  Run `node --experimental-strip-types --test src/services/publicDomainAudioProviders.test.ts src/services/scriptureAudio.test.ts`; expect every enabled source to pass first/middle/last mapping and trust-boundary checks.
- [ ] **Step 7: Commit**
  Commit the four paths with message `Add verified multilingual Bible audio providers`.

### Task 4: Generalize the reader audio player

**Files:**
- Rename: `src/components/EnglishAudioBible.tsx` to `src/components/ScriptureAudioBible.tsx`
- Modify: `app/read.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `scripts/verify-visual-system-contract.test.mjs`

**Interfaces:**
- Consumes: `edition`, `book`, `chapter`, and reader `palette`.
- Produces: a localized Plus audio card when and only when the exact edition has an enabled source.

- [ ] **Step 1: Add failing structural and localization assertions**
  Update the visual contract test to require `ScriptureAudioBible` and add translation-contract assertions for audio title, listen, pause, loading, retry, unavailable, rights, and locked accessibility copy.
- [ ] **Step 2: Run tests and verify the expected old-component failure**
  Run the visual contract and translation tests; expect failure while the reader still imports `EnglishAudioBible` and hard-codes Turkish/English labels.
- [ ] **Step 3: Implement the shared player**
  Rename the component, replace English-specific lookup with the catalog resolver, return `null` for unsupported editions, use i18n keys for UI states, retain the existing entitlement-first toggle, and clear playback on edition/book/chapter changes.
- [ ] **Step 4: Pass exact edition identity from the reader**
  Read the selected Scripture source metadata already used by `app/read.tsx` and pass its exact edition string to the player. Do not infer audio from `locale`.
- [ ] **Step 5: Run focused verification**
  Run `node --experimental-strip-types --test scripts/verify-visual-system-contract.test.mjs src/i18n/translations.test.ts src/services/scriptureAudio.test.ts src/services/publicDomainAudioProviders.test.ts`; expect success.
- [ ] **Step 6: Commit**
  Commit the four paths and rename with message `Show exact-edition multilingual Bible audio`.

### Task 5: Verify release safety and recovered feature integrity

**Files:**
- Modify only if a failing check exposes a defect in the files changed by Tasks 1–4.

**Interfaces:**
- Consumes: the complete multilingual audio implementation.
- Produces: a clean, reviewable branch with passing automated checks and documented manual limitations.

- [ ] **Step 1: Install dependencies reproducibly**
  Run `npm ci --ignore-scripts` using a writable npm cache under `/tmp`; expect installation from the lockfile without changing tracked files.
- [ ] **Step 2: Run static and automated checks**
  Run `npm run typecheck`, `npm test`, and `git diff --check`; expect zero failures.
- [ ] **Step 3: Verify bundle and network constraints**
  Run the bundle-budget test and search changed source for non-HTTPS media URLs, unallowlisted runtime hosts, bundled `.mp3` files, and locale-only source selection; expect none.
- [ ] **Step 4: Review the complete branch diff**
  Compare against `origin/main`; confirm only the recovered English audio work, approved design/plan documents, multilingual adapters, shared player, evidence, i18n, and tests are present.
- [ ] **Step 5: Commit any verification-only correction**
  If required, commit only the corrected paths with message `Harden multilingual Bible audio release checks`; otherwise create no empty commit.

### Task 6: Publish the implementation safely

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: clean local branch commits.
- Produces: an updated remote recovery branch and draft pull request targeting `main`.

- [ ] **Step 1: Confirm remote base has not moved incompatibly**
  Fetch `main` and verify the branch is still based on or cleanly rebases onto the current remote head; never force-push over unrelated work.
- [ ] **Step 2: Publish commits**
  Push `agent/recover-english-bible-audio`, or recreate the exact Git trees and commits through the connected GitHub API if local Git authentication remains unavailable.
- [ ] **Step 3: Update draft PR #37**
  Ensure the PR title/body describe all enabled languages, exact source editions, rights evidence, test results, and any source left disabled by the acceptance gate.
- [ ] **Step 4: Verify GitHub comparison**
  Confirm the PR is ahead of `main`, contains the intended commits and files, and does not rewrite existing `main` history.
