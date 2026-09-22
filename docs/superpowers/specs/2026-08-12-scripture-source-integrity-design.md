# Scripture Source Visibility and Integrity Design

## Goal

Complete roadmap items 11 and 12 without changing, regenerating, translating,
summarizing, simplifying, or rewriting any Scripture text or published Scripture
pack.

## Scope

- Add a reader-accessible “Text source” destination from Reading Settings.
- Show the selected edition name, license/rights label, full attribution, and
  verified source link.
- Use the existing downloaded-pack metadata (`edition`, `credit`,
  `sourceUrl`) and a small immutable catalog for bundled English, Turkish,
  Spanish, and German editions.
- Add a release-time guard that rejects prohibited Scripture transformation
  affordances in reader/share surfaces.
- Localize the new interface copy for all 38 advertised application languages.
- Mark roadmap items 11 and 12 complete only after automated and Android
  validation pass.

## Architecture

### Metadata boundary

Extend the in-memory Bible data boundary with a `ScriptureSource` object:

- `edition`: the exact selected edition name;
- `rights`: a concise license or public-domain statement;
- `credit`: the existing full attribution string;
- `sourceUrl`: an HTTPS source/right notice;
- `licenseUrl`: optional, used when a separate license page exists.

Downloaded packs already provide edition, credit, and source URL. Their release
registry is the authority; no pack schema or published asset changes. Bundled
metadata is maintained beside the bundled loader catalog and covered by exact
tests.

### User interface

Reading Settings gains one full-width 48 dp “Text source” button. It opens a
dedicated `/scripture-source` screen so long attribution remains readable and
links remain independently accessible. The screen follows the existing legal
screen’s app bar and theme conventions and contains:

1. selected edition;
2. license/rights status;
3. full attribution;
4. source button;
5. optional license button.

Unavailable or malformed links are not opened. The screen falls back to the
selected edition credit and a localized unavailable message; it never guesses a
license.

### Integrity guard

Add a narrow repository script that scans only Scripture reader and share UI
surfaces for prohibited user-facing transformation affordances. The prohibited
set covers summarize, simplify, rewrite, paraphrase, translate, and equivalent
registered translation-key identifiers. Copy, share, bookmark, highlight, and
save-to-journal remain allowed because they preserve the original verse.

The guard runs in CI and the signed Android release workflow. Existing
cryptographic Scripture integrity and rights gates remain unchanged.

## Data safety

- No Scripture JSON file changes.
- No downloaded pack deletion, migration, regeneration, or re-publication.
- No user-state key changes.
- No branch deletion, force-push, or rewrite.
- Work stays on `agent/scripture-source-integrity` until checks pass.

## Localization

Add only reusable interface keys for source title, edition, rights, attribution,
open source, open license, and unavailable state. All 38 advertised locales must
pass the existing production UI parity gate. Edition names, credits, and legal
license names remain source metadata and are not machine-translated.

## Error handling

- Only validated HTTPS URLs are opened.
- Link failures show a localized non-destructive message and leave the screen
  open.
- Missing metadata fails closed to attribution-only display; no public-domain or
  license claim is inferred.
- Unknown locale data uses the already validated English Scripture fallback and
  its matching metadata.

## Verification

- Unit tests for bundled and downloaded source metadata.
- Guard tests proving prohibited affordances fail and preservation actions pass.
- 38/38 UI locale and application-content production gates.
- Typecheck, lint, complete test suite, Scripture integrity and rights gates.
- Android Expo export and signed Android workflow.
- Diff assertion that protected Scripture payloads are unchanged.
- Visual smoke of Reading Settings and the source screen in Dawn and Vigil.

## Acceptance criteria

Roadmap items 11 and 12 may be marked complete only when all verification above
passes and the source screen shows metadata matching the actual selected
Scripture edition.
