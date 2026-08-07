# Global Scripture rollout

Lumen's catalog contains **45 locale tags**. Chinese has Simplified/Traditional variants
and Serbian has Latin/Cyrillic variants. Meriam and the historic Swahili source are only
partial Scripture in the exact public-domain sources we verified, leaving a
**full-Bible target of 43 locale variants / 41 languages**.

## Non-negotiable Scripture rule

Bible text is never machine-translated. A pack is built from a named source edition,
keeps the upstream Scripture text, records source URL + SHA-256, and passes a real
book/chapter structure gate before release.

"Public domain" remains jurisdiction-sensitive. Upstream PD evidence does not replace
jurisdiction review for worldwide store distribution.

Primary references:

- eBible PD explanation: https://ebible.org/publicdomain.htm
- eBible copyright inventory: https://ebible.org/Scriptures/copyright.php
- Open Bibles inventory: https://github.com/seven1m/open-bibles
- CrossWire Bible modules: https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles
- Current Turkish YTC rights: https://ebible.org/turytc/copyright.htm

## Verified coverage

We now have accepted public-domain evidence for **40 full-Bible locale variants /
38 languages**.

Of those, **39 locale variants / 37 languages** already fit and pass the current
Protestant-66 pack gate. Croatian is the extra language: its Šarić Bible is explicitly
Public Domain and complete, but uses a Catholic canon, so it needs canon-aware runtime
support instead of a fake 66-book remap.

The three target languages with no accepted full public-domain source are currently:

- **Bulgarian**
- **Thai**
- **Turkish**

## eBible results

- 30 full-Bible locale variants are in the eBible rights-verified set.
- 29 have direct eBible archive pins; Russian uses a separately tested Synodal fallback.
- 27 direct archives pass the 66-book gate.
- Korean's eBible/Open Bibles corpus is missing 1 Peter 5, but CrossWire `KorRV` passes.
- Russian Synodal fallback passes: 66 books / 31,225 parsed verses.
- Croatian Šarić is complete + Public Domain but requires canon-aware pack support.
- Meriam and historic Swahili are partial and are not counted as full-Bible targets.

## CrossWire public-domain sources — 10/10 validated

Every module below is explicitly marked Public Domain by CrossWire and passes Lumen's
exact SWORD ZIP -> `mod2osis` -> 66-book/chapter gate:

- Albanian `Alb` — 31,036 parsed verses
- Finnish `FinBiblia` — 31,038
- Hungarian `HunKar` — 31,060
- Tagalog `TagAngBiblia` — 31,102
- Danish `DaOT1871NT1907` — 30,997
- Latvian `LvGluck8` — 31,036
- Norwegian Bokmål `Norsk` — 31,035
- Polish `PolGdanska` — 31,073
- Swedish `Swe1917` — 31,003
- Korean `KorRV` — 31,018

The build records source/final SHA-256 and produces a checksum-pinned artifact.

## Māori

The exact Open Bibles Māori file passes the 66-book gate. Its text matches the Māori
Bible version that BibleGateway states is public domain in the United States. It remains
subject to the same worldwide jurisdiction review as the other US-PD claims.

## Rejected “public-domain” candidates

Open Bibles' README label is not treated as proof. Three full-Bible candidates were
rejected after comparing the actual text/rights evidence:

- **Bulgarian** — XML wording matches Veren's contemporary edition; CrossWire marks that
  edition copyrighted and non-commercially distributable in SWORD form, not public domain.
- **Thai** — XML wording matches Thai KJV; CrossWire marks Thai KJV copyrighted with free
  distribution permission, not public domain.
- **Turkish** — XML wording matches modern Kutsal Kitap Yeni Çeviri; CrossWire marks that
  edition copyrighted, and this XML also lacks Obadiah.

These files stay blocked even though their repository README calls them Public Domain.

## Existing Turkish bundle

Current Turkish builds ship **Yorumsuz Türkçe Çeviri (YTC)**. YTC is not public domain;
it is © 2023–2025 İsmail Serinken and eBible.org under CC BY-ND 4.0.

CrossWire's HADI and New Turkish Bible modules are also copyrighted. None are relabeled
as public domain just to increase language count.

## Delivery architecture

1. App ships a locale/edition manifest.
2. User selects a Scripture language independently from UI language.
3. Lumen downloads the exact versioned pack.
4. Download layer verifies released SHA-256.
5. Runtime validates schema, locale, canon and verse shape.
6. Pack is cached for offline reading.
7. Attribution stays visible from the reader.

Production registry URLs require exact source identity, rights basis, source hash,
structural validation, released-pack hash and jurisdiction review.

## Next implementation slice

- add canon-aware pack validation for Croatian;
- continue searching for defensible full public-domain Bulgarian, Thai and Turkish sources;
- add downloaded-pack persistence + checksum verification;
- decouple `scriptureLocale` from UI `locale`;
- expose Bible-language management in Bible/Profile;
- then localize UI, prayer and devotional content with visual QA.
