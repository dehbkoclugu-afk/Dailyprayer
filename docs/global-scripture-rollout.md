# Global Scripture rollout

Lumen's catalog currently contains **45 locale tags**. Chinese has Simplified/Traditional
variants and Serbian has Latin/Cyrillic variants. Two catalog entries (Meriam and Swahili)
only have partial public-domain Scripture in the sources we verified, so the current
**full-Bible target is 43 locale variants / 41 languages**.

The runtime catalog lives in `src/i18n/globalLanguageCatalog.ts`.

## Non-negotiable Scripture rule

Bible text is never machine-translated. Every pack is built from a named source edition,
keeps the upstream Scripture text, records the source URL + source SHA-256, and must pass
the canonical structure gate before release.

"Public domain" is jurisdiction-sensitive. eBible describes its public-domain inventory
in US terms, so worldwide store distribution still needs jurisdiction review.

Primary rights/source references:

- eBible public-domain explanation: https://ebible.org/publicdomain.htm
- eBible Scripture copyright inventory: https://ebible.org/Scriptures/copyright.php
- eBible legal policy: https://ebible.org/legal.php
- Open Bibles source inventory: https://github.com/seven1m/open-bibles
- CrossWire SWORD Bible inventory: https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles
- Current Turkish YTC rights: https://ebible.org/turytc/copyright.htm

## What the structural gate found

The source title is not enough. We actually parse the files and require every chapter of
all 66 canonical Protestant books.

### eBible inventory

- 30 full-Bible locale variants are in the rights-verified eBible inventory set.
- 29 have direct eBible archive source pins; Russian uses the separately tested
  Open Bibles Synodal fallback.
- 27 of those direct archives currently pass the 66-book/chapter gate.
- Croatian is a canon mismatch: that upstream source has Catholic/deuterocanonical
  structure and no standalone canonical Esther entry expected by the current 66-book
  pack schema. We do not remap Scripture to make the test pass.
- Korean's direct eBible/Open Bibles corpus is missing 1 Peter chapter 5.
- Russian Synodal fallback passes: 66 books and 31,225 parsed verses.
- Meriam and the historic Swahili source are partial Scripture, so they are not counted
  as full-Bible targets.

### Open Bibles candidate set

Seven candidate files pass the same full-Bible structure gate:

Albanian, Bulgarian, Finnish, Hungarian, Māori, Tagalog and Thai.

Six candidate files fail and are blocked from production packs:

- Danish — missing Psalm 100
- Latvian — New Testament only
- Norwegian — missing canonical books
- Polish — corrupt/misordered Chronicles structure
- Swedish — missing 1 Peter chapter 4
- Turkish — missing Obadiah

Open Bibles' public-domain label is not treated as sufficient worldwide rights clearance
for these candidates.

### Public-domain CrossWire fallbacks found

CrossWire explicitly marks the following alternate SWORD modules **Public Domain**:

- Danish — `DaOT1871NT1907`
- Latvian — `LvGluck8`
- Norwegian Bokmål — `Norsk` (1930)
- Polish — `PolGdanska` (1881)
- Swedish — `Swe1917`
- Korean — `KorRV` (1952/1961)

They are pinned in `scripts/crosswire-pack-sources.mjs`. Their rights/source discovery
is complete, but they stay out of production until we extract each exact module and run
the same 66-book/chapter gate.

Current hard unresolved full-Bible languages after those fallbacks are **Croatian and
Turkish**. That is a source problem, not a translation problem; Lumen will not fabricate
missing Scripture.

## Existing Turkish bundle

The current Turkish reader ships **Yorumsuz Türkçe Çeviri (YTC)**. YTC is not public
domain; it is © 2023–2025 İsmail Serinken and eBible.org under CC BY-ND 4.0. It must not
be confused with the incomplete Turkish public-domain candidate above.

CrossWire's HADI and New Turkish Bible modules are also copyrighted, so they are not
public-domain fallbacks.

## Delivery architecture

Bundling every Bible into one APK does not scale. Global Lumen uses language packs:

1. App ships UI/content plus a small locale/edition manifest.
2. User selects a Scripture language.
3. Lumen downloads the exact versioned pack.
4. Download layer verifies the released SHA-256.
5. `validateBiblePack` checks schema, locale, all 66 canonical books and verse shape.
6. Validated pack is cached for offline reading and can be deleted/re-downloaded.
7. Attribution travels with the pack and remains visible from the reader.

A production registry never gets a download URL until source identity, rights basis,
source hash, structural validation and released-pack hash are recorded.

## UI/content localization

Scripture language and UI language are separate preferences. Prayer/devotional/UI
localization is a later content layer and never modifies Scripture.

RTL support is required for Arabic and Persian. CJK, Burmese, Thai and other scripts need
font-coverage and layout QA before their UI locales are enabled.

## Next implementation slice

- extract and structurally validate the six CrossWire public-domain fallbacks;
- find independently verifiable full public-domain Croatian and Turkish sources, if any;
- add downloaded-pack persistence + checksum verification;
- decouple `scriptureLocale` from UI `locale`;
- expose Bible-language management in Bible/Profile;
- then localize UI, prayer and devotional content with visual QA.
