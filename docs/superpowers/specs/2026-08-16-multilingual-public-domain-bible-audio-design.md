# Multilingual Public-Domain Bible Audio Design

## Goal

Extend Selaora's Plus-gated chapter audio from English to four additional Scripture editions whose audio can be matched to the exact text edition displayed in the reader:

- German: Lutherbibel 1912
- Spanish: Reina-Valera 1909
- French: Louis Segond 1910
- Japanese: Japanese Freedom Bible 2026

English World English Bible audio remains supported. Italian is explicitly out of scope until a complete, defensibly reusable Diodati 1649 recording is available.

## Product behavior

The reader shows an audio card only when the selected Scripture pack has an enabled audio source for that exact edition. The card keeps the existing Plus entitlement gate and the current load, play, pause, retry, completion restart, and progress behavior.

The card displays the localized audio label plus the exact edition, source or narrator attribution, and rights statement. Selecting a locked card opens the paywall with the existing `bible-audio` context. A source failure never falls through to audio from another edition or language.

## Architecture

### Audio source catalog

Replace the English-only assumptions with a small catalog keyed by stable Scripture edition identity, not merely application locale. Each catalog entry contains:

- locale and exact edition identity;
- public source name and canonical evidence URL;
- attribution and rights copy;
- trusted HTTPS hosts;
- canonical book coverage;
- a source-specific chapter URL resolver.

Edition identity is mandatory because application locale and selected Scripture edition can diverge. No audio card is rendered when the current edition does not match a catalog entry exactly.

### Source-specific resolvers

Each provider keeps its own minimal resolver because their catalogs use different layouts. Resolvers may parse a public directory, playlist, or metadata response, but must:

- accept only HTTPS URLs from the entry's trusted host allowlist;
- keep chapter order deterministic;
- validate book and chapter indices before network access;
- cache successful catalog responses in memory;
- fail closed for missing or malformed catalogs;
- never guess a neighboring chapter or translation.

The existing eBible World English Bible resolver becomes one catalog adapter rather than the universal implementation. Provider behavior stays isolated behind one shared `resolveScriptureAudioChapterUrl` entry point.

### Player component

Rename and generalize `EnglishAudioBible` to `ScriptureAudioBible`. It receives the selected Scripture source identity, book index, chapter index, and reader palette. Source lookup and URL resolution remain outside rendering concerns.

The player owns only playback state and presentation. Changing edition, book, or chapter pauses and clears the current audio before resolving another URL.

## Source acceptance gate

A language is enabled only after all of the following are verified:

1. The recording names the same edition Selaora displays.
2. The recording or its publisher provides a defensible public-domain or unrestricted-use statement for the audio, not only the text.
3. Stable chapter-level HTTPS files or metadata are available without authentication.
4. Canonical coverage is measured and missing chapters are recorded explicitly.
5. Sample chapters from the beginning, middle, and end match their displayed text edition.

Research findings alone do not activate a source. If German, Spanish, French, or Japanese fails this gate during implementation, its adapter and tests may be prepared but the production catalog entry remains disabled until evidence is complete.

## Error handling

- Invalid edition, book, or chapter: do not render or throw into the reader.
- Catalog fetch failure: show the existing retry state.
- Empty or untrusted catalog response: reject it and show retry state.
- Missing chapter: mark that chapter unavailable without substituting audio.
- Playback/network interruption: retain the card and allow retry.
- Entitlement failure: open the paywall; do not resolve the remote URL first.

## Localization and accessibility

Audio labels and status copy use the existing i18n system for all advertised application languages. Edition titles, proper names, rights labels, and source names remain verbatim. The button exposes edition, language, action, and lock/playback state to assistive technology.

## Testing

Add focused tests for:

- exact edition-to-source selection;
- absence of audio for mismatched or unsupported editions;
- canonical book ordering and declared coverage per source;
- chapter index validation;
- trusted-host and HTTPS enforcement;
- provider catalog parsing and deterministic ordering;
- cache clearing and retry behavior;
- Plus/paywall context behavior where already covered by service-level tests.

Run type checking, the focused audio tests, the existing test suite, and relevant visual-system contract checks. Manual device verification covers playback, chapter changes, completion restart, lock behavior, and accessibility labels in each enabled language.

## Rollout

Ship the shared catalog and player refactor together with only source entries that pass the acceptance gate. This avoids a separate feature flag system: an enabled catalog entry is the rollout switch. Source evidence and known coverage limitations are documented alongside the catalog so later audits do not rely on conversation history.

## Non-goals

- Italian audio or generated Italian TTS
- downloading the whole Bible into the application bundle
- offline audio downloads
- background/lock-screen playback redesign
- verse-level timestamps or synchronized highlighting
- changing any Scripture text to match an audio recording
- proxying or mirroring third-party audio without a separate hosting decision
