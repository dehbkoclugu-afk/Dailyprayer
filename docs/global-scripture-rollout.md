# Global Scripture rollout

Lumen's catalog contains **45 locale tags**. Chinese has Simplified/Traditional variants
and Serbian has Latin/Cyrillic variants. Meriam and the historic Swahili source only have
partial public-domain Scripture in the exact sources we verified, so the current
**full-Bible target is 43 locale variants / 41 languages**.

## Non-negotiable Scripture rule

Bible text is never machine-translated. Every pack is built from a named source edition,
keeps the upstream Scripture text, records source URL + SHA-256, and must pass the
canonical structure gate before release.

"Public domain" is jurisdiction-sensitive. An upstream PD declaration is evidence, not an
automatic worldwide store-distribution clearance.

Primary references:

- eBible PD explanation: https://ebible.org/publicdomain.htm
- eBible copyright inventory: https://ebible.org/Scriptures/copyright.php
- eBible legal policy: https://ebible.org/legal.php
- Open Bibles inventory: https://github.com/seven1m/open-bibles
- CrossWire Bible modules: https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles
- Current Turkish YTC rights: https://ebible.org/turytc/copyright.htm

## What the real-file gate found

Source titles and README labels are not trusted by themselves. Builders parse the exact
upstream files and require every chapter of all 66 canonical Protestant books.

### eBible inventory

- 30 full-Bible locale variants are in the eBible rights-verified set.
- 29 have direct eBible archive pins; Russian uses a separately tested Synodal fallback.
- 27 direct archives pass the 66-book gate.
- Korean's eBible/Open Bibles corpus is missing 1 Peter 5, but the CrossWire `KorRV`
  public-domain fallback passes.
- Russian Synodal fallback passes: 66 books / 31,225 parsed verses.
- Croatian Šarić is explicitly Public Domain and is a complete Catholic-canon Bible, but
  it does not fit the current Protestant-66 schema. We will add canon-aware pack support;
  we will not fake Esther mappings just to satisfy the current validator.
- Meriam and historic Swahili are partial Scripture and are not full-Bible targets.

### Open Bibles candidate set

Seven exact files pass the full 66-book structure gate:

Albanian, Bulgarian, Finnish, Hungarian, Māori, Tagalog and Thai.

Their Open Bibles PD labels still need independent rights corroboration before worldwide
production release.

Six Open Bibles files failed structural validation. Five are replaced by independently
declared CrossWire public-domain sources. The sixth, Turkish, is **rejected**: its text
matches the modern Kutsal Kitap Yeni Çeviri wording that CrossWire identifies as
copyrighted, and the XML also lacks Obadiah. It must not ship as a public-domain Bible.

### CrossWire public-domain fallbacks — validated

All six pinned CrossWire SWORD modules are explicitly marked **Public Domain** by
CrossWire and all six pass Lumen's real export + 66-book/chapter gate:

- Danish `DaOT1871NT1907` — 30,997 parsed verses
- Latvian `LvGluck8` — 31,036
- Norwegian Bokmål `Norsk` — 31,035
- Polish `PolGdanska` — 31,073
- Swedish `Swe1917` — 31,003
- Korean `KorRV` — 31,018

The CI path is exact raw ZIP -> SWORD `mod2osis` export -> canonical parser -> chapter
gate -> source/final SHA-256 -> artifact. No Scripture text is translated or synthesized.

## Current coverage

- **41 locale variants** already have a structurally compatible full-Bible source file.
- Those represent **39 languages**.
- Of those, eBible/CrossWire give independent upstream PD evidence for 34 locale variants;
  the seven Open Bibles-only candidates remain rights-review gated.
- Croatian has a complete independently PD source but needs a canon-aware runtime schema.
- Turkish is the only current full-Bible target with no accepted public-domain source.

So the remaining engineering/source problems are intentionally narrow: add Croatian
canon support and find a defensible Turkish full-Bible source (or keep the existing
licensed YTC for Turkish rather than pretending it is public domain).

## Existing Turkish bundle

Current Turkish builds ship **Yorumsuz Türkçe Çeviri (YTC)**. YTC is not public domain;
it is © 2023–2025 İsmail Serinken and eBible.org under CC BY-ND 4.0.

CrossWire's HADI and New Turkish Bible modules are also copyrighted. The mislabeled Open
Bibles Turkish XML is blocked and must never be substituted for YTC as “public domain.”

## Delivery architecture

Global Lumen uses downloadable Scripture language packs:

1. App ships UI/content plus a small locale/edition manifest.
2. User selects a Scripture language.
3. Lumen downloads the exact versioned pack.
4. Download layer verifies the released SHA-256.
5. `validateBiblePack` checks schema, locale, canon and verse shape.
6. Validated pack is cached for offline reading.
7. Attribution remains visible from the reader.

No production registry URL is published until exact source, rights basis, source hash,
structural validation and released-pack hash are recorded.

## UI/content localization

Scripture language and UI language are separate preferences. Prayer/devotional/UI
localization is a later content layer and never modifies Scripture.

RTL support is required for Arabic and Persian. CJK, Burmese, Thai and other scripts need
font-coverage and layout QA before their UI locales are enabled.

## Next implementation slice

- add canon-aware pack validation for the Croatian public-domain edition;
- independently rights-verify the seven structurally complete Open Bibles candidates;
- continue searching for a defensible full public-domain Turkish Bible;
- add downloaded-pack persistence + checksum verification;
- decouple `scriptureLocale` from UI `locale`;
- expose Bible-language management in Bible/Profile;
- then localize UI, prayer and devotional content with visual QA.
