# Global Application Localization Design

Date: 2026-08-10  
Status: Approved design, pending written-spec review

## Goal

Expand Selaora from eight fully translated application locales to every locale
with a full, release-candidate Scripture edition, while retaining the existing
licensed Turkish experience. This produces 41 application locale tags: the 40
entries in `RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS` plus Turkish.

The application interface, onboarding, prayers, devotionals, and reading-plan
content must be available in each application locale. Scripture text must never
be translated, paraphrased, or generated. It continues to come only from the
named, checksum-pinned source editions already governed by the Scripture pack
pipeline. Turkish continues to use the separately licensed YTC edition.

## Scope

### Included

- Add the 40 Scripture release-candidate locale tags to the application locale
  catalog and retain Turkish.
- Bundle compact UI chrome for all application locales.
- Distribute longer first-party content as a downloadable application-content
  pack per locale.
- Localize onboarding and quiz copy, guided prayers, devotionals, reading-plan
  metadata, and other first-party devotional copy.
- Support right-to-left application layout for Arabic and Persian.
- Preserve Simplified/Traditional Chinese and Latin/Cyrillic Serbian as distinct
  locale tags.
- Resolve full BCP-47 device locales to the correct supported application tag.
- Validate completeness, integrity, locale identity, and safe activation.

### Excluded

- Machine translation or modification of Scripture.
- Advertising Bulgarian, Thai, partial Meriam, or partial Swahili Scripture as
  a complete localized application experience.
- Cloud accounts, content sync, or a new backend.
- Runtime machine translation.
- Native-speaker certification. Generated translations are release candidates
  until editorial review; the system must retain English source material so a
  reviewer can compare and revise them later.

## Product Behavior

The application language and Scripture edition remain independent preferences.
Changing the application language changes UI and first-party content only. It
must not silently replace the user's chosen Scripture edition.

Compact UI chrome is shipped in the binary so language selection, errors,
download progress, legal navigation, purchase flows, and recovery always remain
understandable. Longer content is downloaded when the user selects a language
whose current content pack is not installed.

The selected language becomes active only after its content pack is downloaded,
checksum-verified, parsed, and validated. Until then, the current language stays
active. A failed or interrupted download leaves no partially active locale and
offers retry or cancellation.

Once installed, the content pack is available offline. Updated manifests may
offer a newer version later; failure to update never destroys a valid installed
pack.

## Architecture

### Canonical locale catalog

`src/i18n/applicationLocales.ts` remains the source of truth for supported
application locale tags, native labels, and text direction. Its supported set
is derived from the Scripture release-candidate catalog plus Turkish, with an
explicit uniqueness and count assertion.

Every application locale must have:

- complete bundled UI chrome;
- one application-content release in the manifest;
- a locale-specific direction;
- a deterministic BCP-47 resolution path.

The application catalog does not derive the user's Scripture preference.

### Bundled UI chrome

`src/i18n/translations.ts` continues to expose the English key set as the
compile-time contract. Locale dictionaries may be split into one file per
locale to keep changes reviewable, then imported into the existing translation
boundary.

Production application locales may not rely on English fallback for a missing
key. Tests enforce exact key parity and reject empty values, source-language
copies where a translation is expected, and unresolved placeholders.

### Downloadable application-content packs

Long-form localized content moves behind one versioned JSON pack per locale.
The pack contains only first-party content:

- onboarding and quiz content;
- guided-prayer titles, descriptions, steps, and metadata;
- devotional titles and bodies;
- reading-plan titles, descriptions, and first-party day metadata.

Stable IDs remain in the application source and are never translated. Artwork
IDs, navigation routes, durations, premium gates, completion behavior, and
Scripture references remain structural data. A translated pack maps stable IDs
to localized fields.

The pack envelope contains:

- schema version;
- locale tag;
- content version;
- all required content collections.

The release manifest contains the locale, version, byte size, SHA-256 digest,
and HTTPS download URL. The existing Bible-pack download and verification
patterns are reused instead of introducing a second framework or dependency.

### Storage and activation

Application-content packs are downloaded to a temporary file, SHA-256 verified,
parsed, schema-validated, and atomically promoted to the installed location.
Only then is the user's application language updated.

The English pack remains bundled as the recovery baseline. Existing users of
the original eight locales keep a working experience through migration; their
language preference is preserved and any required content pack is installed or
resolved without data loss.

### Content access

Existing content selectors remain the public interface used by screens. Their
implementation reads the active validated content pack and joins localized
fields to stable source records. Screens do not fetch files or understand pack
formats.

No screen receives a mixture of locales. If an installed pack becomes invalid,
the content boundary returns the complete bundled English recovery pack and
surfaces a localized retry action instead of partially falling back field by
field.

## Translation Rules

- Translate first-party application and devotional prose naturally for the
  target language and Christian context.
- Preserve meaning, tone, variables, interpolation markers, stable IDs, URLs,
  prices supplied by the store, and accessibility intent.
- Do not add doctrinal claims absent from the English source.
- Do not present generated prose as a Bible quotation.
- Do not translate Scripture text. Scripture references may use existing
  verified localized book-name metadata, but chapter and verse identity must
  remain unchanged.
- Keep the English source content available for comparison and future editorial
  correction.
- Mark each generated locale as `release-candidate` in localization metadata
  until native editorial review promotes it to `reviewed`.

## RTL and Typography

Arabic and Persian set the application root direction to RTL after locale
activation. Rows, back/forward semantics, alignment, and directional icons
mirror where they convey direction. Media controls, numeric Scripture identity,
and non-directional artwork do not mirror blindly.

Locale changes that cross LTR/RTL boundaries use the minimum restart or root
remount required by React Native. All locale layouts must support long text,
font scaling, wrapping, and existing accessibility touch targets. No new font
dependency is added unless device fallback demonstrably cannot render a target
script.

## Error Handling

- No network: keep current locale active and offer retry.
- Missing manifest entry: do not advertise the locale as selectable in a
  production release.
- Checksum mismatch: delete the temporary file, retain the installed version,
  and report a localized integrity error.
- Invalid schema, wrong locale, missing IDs, or duplicate IDs: reject the pack
  before activation.
- Interrupted update: retain the last valid pack.
- Removed or unsupported stored locale: resolve safely to English without
  changing Scripture data.
- RTL activation failure: do not leave a mixed-direction view; revert to the
  prior locale and report retry guidance.

## Release and Hosting

Application-content packs are published as versioned GitHub Release assets,
matching the existing Bible-pack distribution model. A checksum-pinned manifest
is the only catalog consumed by production clients. Publishing scripts generate
the manifest from validated pack artifacts; they do not translate content.

All 41 locales must pass the same release gate before being advertised. A locale
cannot be enabled by adding only UI chrome or only a content pack.

## Testing

Automated tests must cover:

- exact locale-catalog membership, uniqueness, direction, and expected count;
- complete UI-key parity for every locale;
- complete content-ID parity for prayers, devotionals, plans, and quiz content;
- placeholder, empty-string, and accidental English-source leakage checks;
- BCP-47 resolution, including Chinese and Serbian script variants;
- Arabic and Persian RTL classification;
- manifest validation and rejection of missing, duplicate, or unexpected
  locales;
- checksum mismatch, wrong-locale pack, invalid schema, interrupted download,
  and last-valid-version recovery;
- atomic language activation;
- preservation of the independent Scripture preference;
- a Scripture-integrity guard proving no Scripture asset or text changed;
- typecheck, lint, unit tests, Android export, and representative LTR/RTL visual
  smoke before release.

## Delivery Sequence

1. Add the pack schema, content selectors, manifest validation, storage, and
   activation flow while preserving the existing eight-language behavior.
2. Split and complete bundled UI dictionaries for the target catalog.
3. Generate and validate downloadable first-party content packs in manageable
   locale batches, without touching Scripture assets.
4. Add RTL root behavior and focused Arabic/Persian visual QA.
5. Publish versioned content-pack assets and the manifest.
6. Run the complete release gate and enable all passing locales together.

## Acceptance Criteria

- The language picker advertises exactly the 40 full-Bible release-candidate
  locale tags plus Turkish.
- Every advertised locale has complete bundled UI chrome and a complete,
  validated first-party content pack.
- Selecting an uninstalled locale downloads and activates it atomically; it
  then works offline.
- Failure never leaves mixed-language, partial, or corrupted active content.
- Arabic and Persian operate in coherent RTL layouts.
- Scripture preference remains independent and Scripture text/assets are
  byte-for-byte untouched by this project.
- Typecheck, lint, tests, Android export, and localization release gates pass.
