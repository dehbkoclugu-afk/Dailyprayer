# Scripture Source Evidence

Retrieved and reviewed: 2026-07-26

This manifest records the provenance used by Lumen's six bundled Scripture
editions. It is evidence for attribution and future release checks, not a
substitute for legal review. The bundled Scripture files are immutable under
`docs/scripture-integrity.md`.

## Turkish — Yorumsuz Türkçe Çeviri (YTC)

- Bundled file: `src/data/bible-full.tr.json`
- Bundled SHA-256: `d757feb4e32f2059750d34804569a5ee7be65952a28c6463f7fcfdedc0135ab1`
- Official details: https://ebible.org/find/details.php?id=turytc
- Official copyright notice: https://ebible.org/turytc/copyright.htm
- Download used by the generator: https://ebible.org/Scriptures/turytc_vpl.zip
- Copyright: © 2023–2025 İsmail Serinken and eBible.org
- License: CC BY-ND 4.0
- License URL: https://creativecommons.org/licenses/by-nd/4.0/
- Required conditions: retain copyright/source/license information and do not
  distribute changes to the Scripture words or punctuation.
- Evidence limitation: the original downloaded archive was not retained with
  an immutable upstream Git blob SHA. Pin and verify the exact upstream artifact
  before roadmap release-gate item 13 can pass.

## English — World English Bible

- Bundled file: `src/data/bible-full.en.json`
- Bundled SHA-256: `99213d02de0b38dc3b87085af5b26bb90f314646e02b6862498a762a980cc160`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/eng-web.usfx.xml
- Immutable source Git blob SHA: `c898213b278127896f583501b29ae09b89f3d009`
- Official rights notice: https://ebible.org/eng-web/copyright.htm
- Rights status: public domain. “World English Bible” is an eBible.org
  trademark and must identify unchanged text.

## Spanish — Reina-Valera 1909

- Bundled file: `src/data/bible-full.es.json`
- Bundled SHA-256: `8591b6aaf8939d9c451d4677355244e0e5a9c79fdb860985c8c2c3adc48a0c35`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/spa-rv1909.usfx.xml
- Immutable source Git blob SHA: `15333dbdd191580be5c7afaf7f8ed7f227b5bbd6`
- Upstream manifest: https://github.com/seven1m/open-bibles/blob/master/README.md
- Upstream rights claim: public domain.

## Portuguese — João Ferreira de Almeida

- Bundled file: `src/data/bible-full.pt.json`
- Bundled SHA-256: `f9c4527f7c009494bfdad0ca57a5d9588c98e87e29ff25336e8e9a8041033708`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/por-almeida.usfx.xml
- Immutable source Git blob SHA: `3f7971040c33a77329b8c73f0918ae2f0db05155`
- Upstream manifest: https://github.com/seven1m/open-bibles/blob/master/README.md
- Upstream rights claim: public domain.
- Evidence limitation: the upstream filename does not identify a dated Almeida
  revision. Confirm the exact edition before release.

## French — Ostervald 1996

- Bundled file: `src/data/bible-full.fr.json`
- Bundled SHA-256: `2e6d48e7272828ffc736c2b196699e0429ba1d56152708e8dca32bac8f1e7e0c`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/fra-ostervald.osis.xml
- Immutable source Git blob SHA: `cc262519cd03e4813f9f70e69681684ac66a3a94`
- Upstream manifest: https://github.com/seven1m/open-bibles/blob/master/README.md
- Upstream rights claim: public domain.
- Evidence limitation: eBible.org independently lists the historical French
  Ostervald Bible as public domain, but the evidence reviewed does not establish
  the rights status of this specific 1996 revision. Independent verification is
  pending under roadmap item 10.

## German — Luther Bible 1912

- Bundled file: `src/data/bible-full.de.json`
- Bundled SHA-256: `003cf8e9caa2d4c1f104ad5f6bdcb7be474ba63837fe4f8213639b7878159c4a`
- Imported source: https://github.com/seven1m/open-bibles/blob/master/deu-luther1912.osis.xml
- Immutable source Git blob SHA: `8d3ca6b9a75184ec3735c51ad4bd9a6bd05acebb`
- Upstream manifest: https://github.com/seven1m/open-bibles/blob/master/README.md
- Independent listing: https://ebible.org/Scriptures/copyright.php
- Rights status: public domain.
