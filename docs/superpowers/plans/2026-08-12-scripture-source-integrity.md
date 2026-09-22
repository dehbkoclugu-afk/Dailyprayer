# Scripture Source Visibility and Integrity Implementation Plan

**Goal:** Complete Selaora roadmap items 11 and 12 while preserving every Scripture payload and published pack.

**Branch:** `agent/scripture-source-integrity`

**Protected boundary:** Do not modify `src/data/bible-full.*.json`, released Bible pack assets, user-state keys, or existing branches.

## Task 1 — Source metadata boundary

**Files**
- Modify: `src/data/bibleFull.ts`
- Create: `src/data/bibleSource.test.ts`
- Modify: `package.json`

1. Add a `ScriptureSource` contract with edition, rights, credit, source URL, and optional license URL.
2. Define exact immutable metadata for bundled English WEB, Turkish YTC, Spanish RV1909, and German Luther 1912.
3. Preserve downloaded-pack edition, credit, and source URL when registering a validated pack; do not change the pack schema.
4. Expose `getBibleSource(locale)` from the same loader boundary as `getBible` so text and metadata cannot select different editions.
5. Test bundled metadata, downloaded metadata, HTTPS validation inputs, and fallback consistency.
6. Run the focused test and typecheck.

## Task 2 — Reader source screen

**Files**
- Create: `app/scripture-source.tsx`
- Modify: `src/components/ReadingSettingsSheet.tsx`

1. Add one 48 dp full-width “Text source” control to Reading Settings.
2. Close the modal before navigating to `/scripture-source`.
3. Render the exact selected edition, rights status when known, full attribution, source action, and optional license action.
4. Open only HTTPS URLs. On failure, show localized non-destructive feedback and remain on screen.
5. When rights metadata is absent, show no inferred claim; retain exact edition/credit and source notice.
6. Match existing Legal screen app-bar, safe-area, typography, Dawn/Vigil, and accessibility conventions.
7. Run typecheck and lint.

## Task 3 — Complete localization

**Files**
- Modify: `src/i18n/translations.ts`
- Modify: all advertised `src/i18n/locales/*.ts`

Add these reusable keys in every advertised application locale:

- `scriptureSource.title`
- `scriptureSource.edition`
- `scriptureSource.rights`
- `scriptureSource.attribution`
- `scriptureSource.openSource`
- `scriptureSource.openLicense`
- `scriptureSource.rightsUnavailable`
- `scriptureSource.linkError`

Edition names, credits, copyright holders, and formal license names remain source metadata and are not translated.

Run:
- `npm run ui-locales:verify:production`
- `npm run application-content:verify:production`
- translation tests and typecheck.

## Task 4 — Prohibited transformation release guard

**Files**
- Create: `scripts/verify-scripture-ui-integrity.mjs`
- Create: `src/data/scriptureUiIntegrity.test.ts` or a focused Node fixture test
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/android-release.yml` (use the actual signed Android workflow filename)

1. Scan only Scripture reader/share UI surfaces and registered Scripture action translation identifiers.
2. Reject user-facing affordances for summarize, simplify, rewrite, paraphrase, and automatic translation.
3. Keep preservation actions—copy, share, bookmark, highlight, journal save—allowed.
4. Make the script deterministic, dependency-free, and fail closed when a protected surface is missing.
5. Add the guard to CI and signed Android release before building.
6. Prove one forbidden fixture fails and existing preservation actions pass.

## Task 5 — Roadmap and full verification

**Files**
- Modify: `docs/design-100.md`

1. Run the complete test suite, typecheck, lint, production localization gates, Scripture integrity, Scripture rights, and the new UI integrity guard.
2. Run Android Expo export.
3. Assert no protected Scripture JSON path changed relative to `main`.
4. Capture Dawn and Vigil smoke screenshots for Reading Settings and the source screen through the existing Android smoke workflow.
5. Mark items 11 and 12 complete only after all checks pass.
6. Commit the cohesive implementation, push the branch, open a focused PR against `main`, wait for CI, and merge only if all checks succeed.
7. Confirm `main` and `backup/pre-main-normalization-2026-08-12` remain untouched until merge.
