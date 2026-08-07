# Global Scripture rollout

Lumen's long-term target is **43 languages / 45 locale tags**. Chinese is split into
Simplified/Traditional and Serbian into Latin/Cyrillic. The runtime catalog lives in
`src/i18n/globalLanguageCatalog.ts`.

## Non-negotiable Scripture rule

Bible text is never machine-translated. Every language pack must be built from a named
source edition, preserve the source text, record its source URL + source SHA-256, and pass
the pack validator before release.

"Public domain" is jurisdiction-sensitive. eBible's inventory says its public-domain
classification is for the USA to the best of its knowledge. Therefore a second
jurisdiction review is still required before worldwide Google Play distribution.

Primary rights references:

- eBible public-domain explanation: https://ebible.org/publicdomain.htm
- eBible Scripture copyright inventory: https://ebible.org/Scriptures/copyright.php
- eBible legal policy: https://ebible.org/legal.php
- Open Bibles source/license inventory: https://github.com/seven1m/open-bibles
- Current Turkish YTC rights: https://ebible.org/turytc/copyright.htm

## Release states

### A — eBible public-domain inventory

The 32 locale tags marked `verified-us-public-domain` correspond to 30 languages
currently listed in eBible's Public Domain Bibles inventory. They may proceed to source
pinning, structural validation and jurisdiction review.

### B — second-source review required

13 languages are intentionally marked `candidate-needs-review`. Open Bibles labels the
candidate editions public domain, but Lumen must independently verify the exact edition
and distribution jurisdiction before creating a production pack:

Albanian, Bulgarian, Danish, Finnish, Hungarian, Latvian, Māori, Norwegian, Polish,
Swedish, Tagalog, Thai and Turkish.

Polish Biblia Gdańska 1881 additionally has a CrossWire public-domain declaration:
https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=PolGdanska

### Existing Turkish bundle

Today's Turkish reader ships **Yorumsuz Türkçe Çeviri (YTC)**. YTC is not public domain;
it is © 2023–2025 İsmail Serinken and eBible.org under CC BY-ND 4.0. Redistribution is
allowed with attribution, but derivative Scripture text is not. The Turkish public-domain
candidate in the global catalog is a future alternative pack and must never be confused
with YTC.

## Delivery architecture

Bundling ~4 MB of raw JSON per Bible into one APK does not scale to 43 languages. Global
Lumen therefore uses language packs:

1. App ships UI/content plus a small locale/edition manifest.
2. User selects a Scripture language.
3. Lumen downloads the exact versioned pack for that locale.
4. Download layer verifies the released SHA-256.
5. `validateBiblePack` checks schema, locale, all 66 canonical books and verse shape.
6. Validated pack is cached for offline reading and can be deleted/re-downloaded.
7. Attribution travels with the pack and is always available from the reader.

A production pack registry must not contain a download URL until its exact source,
rights basis and hashes are recorded.

## UI/content localization

Scripture language and UI language should become separate preferences. Until a UI locale
has human-reviewed strings, Lumen may show its Bible in the chosen language while the app
chrome falls back to English. Prayer/devotional translations are a separate content task
and do not alter Scripture.

RTL support is required for Arabic and Persian before those UI locales are enabled.
CJK, Burmese, Thai and other scripts also require font-coverage QA before release.

## Next implementation slice

- source-pin and build the eBible inventory packs;
- add downloaded-pack persistence/checksum verification;
- decouple `scriptureLocale` from the current UI `locale`;
- expose Bible-language management in the Bible/Profile screens;
- then expand human-reviewed UI, prayer and devotional localization.
