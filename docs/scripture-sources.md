# Scripture Source Evidence

Retrieved and reviewed: 2026-07-26

This manifest records the provenance and rights verification for Lumen's six
bundled Scripture editions. It is evidence for attribution and release checks,
not a substitute for legal review.

The verdicts below are enforced in code by `src/data/scriptureRights.ts` and
`npm run release-gate`. Verification was performed for roadmap item 10; two
editions failed it and were replaced.

## Verdicts

| Locale | Edition | Rights status | Attribution required |
| --- | --- | --- | --- |
| tr | Yorumsuz Türkçe Çeviri (YTC) | Licensed, CC BY-ND 4.0 | Yes |
| en | World English Bible | Public domain | Trademark condition |
| es | Reina-Valera 1909 | Public domain | No |
| pt | Bíblia Livre (from the 1819 Almeida) | Licensed, CC BY 4.0 | Yes |
| fr | La Sainte Bible (Ostervald) | Public domain | No |
| de | Luther Bible 1912 | Public domain | No |

All six pass the release gate. Two are licensed rather than public domain, so
their text must stay verbatim and carry its credit.

## Bundled file manifest

**This table is the authority.** `npm run scripture-check` reads it and fails if a
bundled file no longer matches, so a change to Scripture data is only accepted by
updating this table in the same commit. Run it before every release; CI runs it on
every push and the APK workflow runs it before building.

<!-- scripture-manifest:start -->

| Locale | File | SHA-256 | Books | Chapters | Verses |
| --- | --- | --- | --- | --- | --- |
| tr | `src/data/bible-full.tr.json` | `3da984d938f693538f0b1a539f331fb00200ee8c689e1157d2d9f948765f1bca` | 66 | 1189 | 31059 |
| en | `src/data/bible-full.en.json` | `99213d02de0b38dc3b87085af5b26bb90f314646e02b6862498a762a980cc160` | 66 | 1189 | 31098 |
| es | `src/data/bible-full.es.json` | `8591b6aaf8939d9c451d4677355244e0e5a9c79fdb860985c8c2c3adc48a0c35` | 66 | 1189 | 31084 |
| pt | `src/data/bible-full.pt.json` | `e480d1bb55323ce9766e5fd52e301f95ea0c0324576114dea662fc8864906ac3` | 66 | 1189 | 31102 |
| fr | `src/data/bible-full.fr.json` | `309a522b1c9c857c9741d1622f35c1c7d12c632df6de324dd56812ca62699cd5` | 66 | 1189 | 31107 |
| de | `src/data/bible-full.de.json` | `003cf8e9caa2d4c1f104ad5f6bdcb7be474ba63837fe4f8213639b7878159c4a` | 66 | 1189 | 31171 |

<!-- scripture-manifest:end -->

Verse counts differ legitimately between editions: they follow each edition's own
verse divisions, and a chapter may merge or split verses. What must never differ
is the book and chapter count — all six carry the same 66 books and 1189 chapters.

The en, es and de files are byte-identical to their previous builds — the
2026-07-26 rebuild reproduced them exactly from the same pinned upstream blobs,
which confirms the generator is deterministic and that the parser change made for
the new sources did not alter the untouched locales.

### Apocryphal books are not bundled

The WEB source (`eng-web.usfx.xml`) also contains 20 non-canonical books
(Sirach, Tobit, Judith, 1–4 Maccabees, Wisdom, and others). The generator keeps
only the 66-book canon, so they never reach the app. The five ranged verse ids in
that file (`11:15-16`, `16:15-16`, `19:18-19`, `22:9-10`, `26:19-27`) are all in
Sirach and their content is an editorial note — "Verses 15 and 16 are omitted by
the best authorities" — not Scripture. Verified 2026-07-26: **zero** ranged verse
ids occur inside a canonical book in any of the four USFX sources, so no canonical
verse is dropped by the generator's numeric-id parsing.

## Turkish — Yorumsuz Türkçe Çeviri (YTC)

**Verdict: licensed, verified.** The copyright holder states the terms on its own
official page, which is authoritative.

- Bundled file: `src/data/bible-full.tr.json`
- Official details: https://ebible.org/find/details.php?id=turytc
- Official copyright notice: https://ebible.org/turytc/copyright.htm
- Download used by the generator: https://ebible.org/Scriptures/turytc_vpl.zip
- Copyright: © 2023–2025 İsmail Serinken and eBible.org
- License: CC BY-ND 4.0 (https://creativecommons.org/licenses/by-nd/4.0/)
- Required conditions, quoted from the copyright page: "You include the above
  copyright and source information" and "You do not make any derivative works
  that change any of the actual words or punctuation of the Scriptures."

### Upstream artifact

- Artifact: `turytc_vpl.zip`, retrieved 2026-07-26
- Artifact SHA-256: `b6d9d6ea703ecd4a242a885934ba4a7e7a9644809844792744a1b11523787561`
- Upstream states: source files dated 22 Jul 2026, HTML generated 23 Jul 2026.

The publisher regenerates this artifact, so its SHA-256 is a retrieval-dated
record rather than a permanent identifier. eBible.org states the translation is
still under review ("Bu İncil tercümesi kontrol ediliyor"), so the upstream text
changes over time and should be re-compared before each release.

### Text drift: resolved 2026-07-26

The bundled text was compared verse-by-verse against the 2026-07-26 download:
66/66 books, **31,059 verses, 4 differences** — all upstream corrections made
after the previous export. The bundle was re-exported verbatim from that download,
which is permitted by `docs/scripture-integrity.md` ("a newly verified verbatim
export of the same approved edition"). The re-export changed exactly those four
verses and nothing else; book names, verse labels, chapter structure and the
credit are unchanged, and `src/data/bible-books.json` is byte-identical.

| Reference | Previous bundle | Current (upstream-corrected) |
| --- | --- | --- |
| 2 Kings 19:8 | "Aşur Kralı'nın Livna'ya karşı savaşır buldu" | "Aşur Kralı'nı Livna'ya karşı savaşır buldu" |
| 2 Kings 20:6 | "kulum David'in hatırına" | "hizmetkârım David'in hatırına" |
| 2 Kings 20:19 | "esenlik ve gerçek olacak" | "esenlik ve doğruluk olacak" |
| Acts 7:45 | "o ulusları Tanrı David'in günlerine" | "o ulusları Tanrı, David'in günlerine" |

## English — World English Bible

**Verdict: public domain, verified.** The publisher dedicates the WEB to the
public domain in its own rights notice.

- Bundled file: `src/data/bible-full.en.json`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/eng-web.usfx.xml
- Immutable source Git blob SHA: `c898213b278127896f583501b29ae09b89f3d009`
  (re-verified 2026-07-26)
- Official rights notice: https://ebible.org/eng-web/copyright.htm
- Condition: "World English Bible" is an eBible.org trademark and must identify
  unchanged text.
- Known gap: the upstream file contains 5 ranged verse ids (for example `15-16`)
  that the generator skips, so those verses are absent from the bundle. Left
  as-is because fixing it changes bundled Scripture; worth resolving alongside
  roadmap item 13.

## Spanish — Reina-Valera 1909

**Verdict: public domain, verified.** Published in 1909; its revisers died more
than 70 years ago, so protection has expired independently of any upstream label.

- Bundled file: `src/data/bible-full.es.json`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/spa-rv1909.usfx.xml
- Immutable source Git blob SHA: `15333dbdd191580be5c7afaf7f8ed7f227b5bbd6`
  (re-verified 2026-07-26)
- Upstream manifest: https://github.com/seven1m/open-bibles/blob/master/README.md
- Artifact inspection (2026-07-26): the file carries `<languageCode>spa</languageCode>`
  and Strong's number markup, but no rights statement. The verdict rests on the
  1909 publication date, not on the upstream label.

## German — Luther Bible 1912

**Verdict: public domain, verified.** Published in 1912; its revisers died more
than 70 years ago, so protection has expired.

- Bundled file: `src/data/bible-full.de.json`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/deu-luther1912.osis.xml
- Immutable source Git blob SHA: `8d3ca6b9a75184ec3735c51ad4bd9a6bd05acebb`
  (re-verified 2026-07-26)
- Independent listing: https://ebible.org/Scriptures/copyright.php
- Artifact inspection (2026-07-26): the OSIS header states rights as "We believe
  that this Bible is found in the Public Domain", credits `<publisher>FREE BIBLE
  SOFTWARE GROUP</publisher>`, and gives `<source>unbekannt</source>`. That is a
  belief, not a determination, so the verdict rests on the 1912 publication date.

## Portuguese — Bíblia Livre (replaced 2026-07-26)

**Verdict: licensed, verified.** eBible.org publishes the copyright holders and
the CC BY 4.0 terms, and the rights holders state their own attribution
requirement.

- Bundled file: `src/data/bible-full.pt.json`
- Edition: "The Holy Bible in Brazilian Portuguese, updated from the 1819
  translation by João Ferreira de Almeida, Textus Receptus edition"
- Official copyright notice: https://ebible.org/porbr2018/copyright.htm
- Copyright: © 2018 Diego Santos, Mario Sérgio, e Marco Teles
- License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
- Required conditions: include the copyright and source information; if the text
  is changed, indicate that clearly so the original licensor is not shown as
  endorsing the change. The rights holders also ask that the version date be
  cited, as the translation is a work in progress.
- Upstream artifact: `porbr2018_usfx.zip`, retrieved 2026-07-26,
  SHA-256 `71ff5f1a2e464e8c0351a26172d6be5c7c3d4110aed318486d539c588ddcf859`
- Inner USFX SHA-256: `3d25649aa3c413a8793aa0e00902a55e429d5731498c56fb143503101a735ec7`
- Upstream revision date: 2022-03-08
- Build check: 66 books, 1189 chapters, 31,102 verses, no empty chapter or verse,
  no residual markup.

### Why the previous Portuguese file was rejected

`por-almeida.usfx.xml` (Git blob `3f7971040c33a77329b8c73f0918ae2f0db05155`,
labelled public domain by the upstream README) failed verification on 2026-07-26:

- The file has **no `<header>`, no `<rights>` element, and no `<languageCode>`** —
  it begins directly at `<book id="GEN">`. It carried no rights statement at all.
- It named **no dated revision**. "João Ferreira de Almeida" alone spans editions
  from 1681 to modern revisions, some actively under copyright (for example
  Almeida Revista e Atualizada, © Sociedade Bíblica do Brasil).
- Its wording matched no well-known revision cleanly. Genesis 1:2 read "A terra
  era sem forma e vazia; e havia trevas sobre a face do abismo, mas o Espírito de
  Deus pairava sobre a face das águas"; the text used "Jeová" 28 times, mixed-case
  "Senhor" (Psalm 23:1 "O Senhor é o meu pastor; nada me faltará"), and pre-1990
  Brazilian orthography ("dêem").

No public-domain Almeida exists in eBible.org's catalogue, so the replacement is
licensed rather than public domain. The public-domain Portuguese alternative,
`porbrbsl` (Bíblia Portuguesa Mundial), is described by its own publisher as "um
rascunho de tradução da Bíblia Sagrada e ainda em revisão" — a draft — and is not
in the Almeida tradition, so Bíblia Livre was preferred: it is Almeida-derived,
complete, dated, and carries an explicit licence grant.

## French — La Sainte Bible (Ostervald) (replaced 2026-07-26)

**Verdict: public domain, verified.** Published by eBible.org with an
authoritative public-domain notice, and it predates the disputed 1996 layer.

- Bundled file: `src/data/bible-full.fr.json`
- Edition as published: title "La Sainte Bible", described as "The Holy Bible in
  French, Ostervald", "Translation by: Ostervald"; eBible id `fra_fob`, Sword
  module name `fraFOB1744eb`
- Official copyright notice: https://ebible.org/fra_fob/copyright.htm ("Public
  Domain")
- Catalogue entry: https://ebible.org/Scriptures/translations.csv (`fra_fob`,
  Copyright "public domain", Redistributable true)
- Upstream artifact: `fra_fob_usfx.zip`, retrieved 2026-07-26,
  SHA-256 `6229988acf19d07270eae4cd1834e242a63e1043a94776c697093d407fbf1fed`
- Inner USFX SHA-256: `699b8b5835489f808b71aedfa150e906a43e3517120153f246865ff4aeb9a96f`
- Build check: 66 books, 1189 chapters, 31,107 verses, no empty chapter or verse,
  no residual markup. Genesis 1:1 "Au commencement, Dieu créa les cieux et la
  terre."; Psalm 23:1 "Psaume de David. L'Éternel est mon berger; je n'aurai
  point de disette."

### Why the previous French file was rejected

`fra-ostervald.osis.xml` (Git blob `cc262519cd03e4813f9f70e69681684ac66a3a94`,
labelled "French Ostervald 1996 — Public Domain" by the upstream README) failed
verification on 2026-07-26:

1. **The "public domain" label was a third-party self-declaration, not the rights
   holder's.** Its OSIS header stated `<rights>Public Domain</rights>` but
   attributed the packaging to `<publisher>FreeBibleSoftwareGroup</publisher>`,
   `<creator>TextFactory</creator>`, `<contributor>Louange.org</contributor>`,
   converted by `ZefToOsis 1.0.0` from `<source>http://unbound.biola.edu/…</source>`.
   None of these is the 1996 reviser or publisher. Mirrors such as gratis.bible
   repeat this same header, so they were not independent corroboration.

2. **The 1996 revision contains 1996 editorial work.** Its own preface
   (https://github.com/bible-hub/Bibles/blob/master/French__Ostervald_(1996_revision)__ostervald__LTR-copyright.html)
   states the work is "une mise à jour de l'édition de 1886 d'une révision de la
   Bible d'Ostervald publiée pour la première fois en 1881" and lists the 1996
   editors' own changes: Roman numerals removed, text recut into verses, notes
   regrouped, spelling and grammar modernised, obsolete words replaced, and
   "quelques altérations … au texte de 1886 pour raison de fidélité au Texte
   Reçu" (including "antichrist" for "antechrist"). The preface carries no
   copyright notice and names no rights holder.

3. **The 1996 reviser and publisher are identifiable.** The revision was edited
   under Pastor C. H. Boughman and published in 1996 by Bearing Precious Seed,
   Milford, Ohio (https://levigilant.com/bible_ostervald/remarques.html;
   corroborated by https://www.wayoflife.org/reports/bearing_precious_seed.html).
   A 1996 US publication is protected without formalities, so absent a dedication
   from Boughman or Bearing Precious Seed the 1996 editorial layer was
   presumptively in copyright. No such dedication was found.

The underlying 1881 Frossard / Société Biblique de France revision and its 1886
edition are unambiguously public domain — only the 1996 layer was in doubt, which
is why moving to eBible's historical Ostervald resolves the rights question while
keeping the same textual tradition.

## Re-verification before release

1. Re-download each upstream artifact and confirm the pinned Git blob SHA or the
   published rights notice still says what this document records.
2. Rebuild and confirm the bundled SHA-256 values above still match, or record
   new ones with the reason they changed.
3. For Turkish, re-compare against the current eBible artifact: the translation is
   under active review and drifts.
4. Run `npm run release-gate`. It must exit 0.
