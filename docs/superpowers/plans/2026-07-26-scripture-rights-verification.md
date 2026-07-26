# Scripture rights verification and release gate (roadmap item 10)

Goal: verify the YTC and Ostervald licenses before release, stop presenting any
text of unverified rights or unclear edition as public domain, and block an
unverified locale from the release gate.

Evidence and verdicts: `docs/scripture-sources.md`. This document records the
method so verification can be repeated.

## Task 1: Verify the YTC license and pin the upstream artifact

- [x] **Step 1: Read the rights holder's own notice**

  Fetch https://ebible.org/turytc/copyright.htm and https://ebible.org/find/details.php?id=turytc.
  Confirmed: © 2023–2025 İsmail Serinken and eBible.org, CC BY-ND 4.0, with the
  two stated conditions (retain copyright/source info; make no derivative works
  changing the words or punctuation). This is the authoritative source, so the
  Turkish verdict does not depend on any third party.

- [x] **Step 2: Pin the artifact**

  Download `https://ebible.org/Scriptures/turytc_vpl.zip`, record its SHA-256 and
  retrieval date. Note in the manifest that the publisher regenerates this file,
  so the hash is retrieval-dated evidence rather than a permanent identifier.

- [x] **Step 3: Prove the bundled text is verbatim**

  Re-parse the download with the same regex `scripts/build-bible.mjs` uses and
  compare every verse against `src/data/bible-full.tr.json`. Result: 66/66 books,
  31,059 verses, 4 differences — all upstream corrections made after our export.
  Recorded as an open finding under item 13; not a licensing defect.

## Task 2: Verify the Ostervald 1996 rights status

- [x] **Step 1: Trace the "public domain" label to its origin**

  Inspect the OSIS header of `fra-ostervald.osis.xml`. `<rights>Public Domain</rights>`
  is attributed to FreeBibleSoftwareGroup / TextFactory / Louange.org, converted by
  ZefToOsis from Biola's Unbound Bible — none of them the 1996 reviser. Mirrors
  (gratis.bible, bible-discovery) repeat the same header, so they are not
  independent corroboration.

- [x] **Step 2: Read the 1996 edition's own preface**

  The preface states the work is an update of the 1886 edition of the 1881
  revision, and enumerates the 1996 editors' own changes (verse recutting, notes
  regrouped, modernised spelling, replaced obsolete words, alterations toward the
  Textus Receptus). It carries no copyright notice and names no rights holder, so
  a 1996 editorial layer exists whose rights are unaddressed.

- [x] **Step 3: Identify the 1996 reviser and publisher**

  Edited under Pastor C. H. Boughman, published 1996 by Bearing Precious Seed
  (Milford, Ohio), confirmed by two independent sources. No public-domain
  dedication from either was found.

- [x] **Step 4: Record the verdict**

  Not verified. Note that the underlying 1881/1886 Ostervald text *is*
  unambiguously public domain — only the 1996 layer is in doubt — because that
  shapes the remedy.

## Task 3: Verify the remaining four editions

- [x] **Step 1: Inspect every upstream artifact for a rights statement**

  en: publisher's own PD dedication — verified. es (1909) and de (1912): PD by
  expiry of term; the German file states only a *belief* in PD, so the verdict
  rests on the publication date instead. pt: the file has no header, no
  `<rights>`, no `<languageCode>` and no dated revision; its wording matches no
  single known Almeida revision (Gen 1:2 "mas … pairava", "Jeová" ×28, mixed-case
  "Senhor", pre-1990 orthography). Some Almeida revisions are in copyright, so an
  unidentified one cannot be called public domain.

- [x] **Step 2: Record the second failure**

  Portuguese joins French as release-blocked under item 10's "unclear edition"
  clause.

## Task 4: Make the verdicts binding in code

**Files:**
- Add: `src/data/scriptureRights.ts`, `src/data/scriptureRights.test.ts`,
  `scripts/check-release-gate.mjs`
- Modify: `src/data/bibleFull.ts`, `src/data/legal.ts`, `src/data/legal.test.ts`,
  `scripts/build-bible-i18n.mjs`, `package.json`

- [x] **Step 1: Build the rights registry**

  One record per locale: edition, status (`public-domain` / `licensed` /
  `unverified`), credit line, license terms, source URL, review date, and the
  one-sentence basis for the verdict.

- [x] **Step 2: Stop the false claim reaching users without touching Scripture**

  The generator froze `"… · Domaine public"` and `"… · Domínio público"` into the
  bundled JSON, and those files are immutable under `docs/scripture-integrity.md`.
  So `getBibleCredit()` now reads the registry instead of the JSON `credit` field.
  The stale claim stays on disk, unread; a test asserts both halves of that.

- [x] **Step 3: Correct the Terms**

  Replace the "upstream labels it public domain" wording for French and
  Portuguese with the actual finding, and mirror it into
  `docs/legal/terms-of-service.md`.

- [x] **Step 4: Add the release gate**

  `npm run release-gate` fails while a locale with unverified rights is still
  bundled, and reports the locale, the basis, and the three ways to resolve it.
  Deliberately outside `npm test` so development stays green while release stays
  blocked.

- [x] **Step 5: Run all checks**

  `npm run typecheck`, `EXPO_NO_TELEMETRY=1 npm run lint`, `npm test` (29/29),
  Android Expo export — all exit 0. `npm run release-gate` exits 1, which is the
  intended state until fr/pt are resolved.

- [x] **Step 6: Verify protected scope**

  `git status --porcelain` shows no Scripture JSON, verse data, book metadata or
  generator output changed; all six bundled SHA-256 values still match the
  manifest. `git diff --check` clean.

## Open decision for the product owner

French and Portuguese cannot ship as they stand. Choose per locale: swap to a
verified public-domain edition (recommended for French — an older PD Ostervald
keeps the same textual tradition without the 1996 layer), obtain written
permission from the rights holder, or drop the locale from the build. Whichever
is chosen, update `src/data/scriptureRights.ts` and `docs/scripture-sources.md`
until `npm run release-gate` passes.
