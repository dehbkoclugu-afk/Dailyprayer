# Scripture Attribution Design

## Goal

Replace the Terms of Service's incorrect single-source statement with a
traceable disclosure for all six bundled Scripture editions. Do not alter,
translate, normalize, or regenerate Scripture text, book names, verse labels,
headings, or embedded credits.

## Evidence Boundary

The disclosure may state only what the checked source evidence supports:

- Yorumsuz Türkçe Çeviri (YTC) is copyright © 2023–2025 İsmail Serinken and
  eBible.org and is distributed under CC BY-ND 4.0. It is not public domain.
- World English Bible is public domain. Its name is an eBible.org trademark and
  must identify an unchanged copy.
- The `seven1m/open-bibles` source manifest labels Reina-Valera 1909, João
  Ferreira de Almeida, French Ostervald 1996, and Luther Bible 1912 as public
  domain.
- eBible.org independently lists Luther Bible 1912 and the historical French
  Ostervald Bible as public domain, but it does not independently establish the
  rights status of the repository's specific 1996 Ostervald revision.

The product must therefore identify the Ostervald 1996 upstream claim and keep
its independent release verification visibly pending. It must not upgrade that
claim into an unqualified legal conclusion.

## Chosen Approach

Use two layers:

1. Add a readable `Scripture sources and rights` section to both the in-app
   Terms source and its hosted Markdown mirror. Each edition receives its own
   bullet with title, rights status or license, and source URL.
2. Add a developer evidence manifest containing retrieval date, exact upstream
   file URL, immutable Git blob SHA where available, bundled JSON SHA-256, and
   verification notes.

This is preferred over a new in-app source screen because roadmap item 12 owns
that interface. It is preferred over embedding audit hashes in Terms because
hashes help release verification, not user comprehension.

## Legal Copy Rules

- Do not call all six editions public domain.
- Preserve the YTC creator names, copyright years, source URL, license name, and
  license URL.
- State that YTC is distributed verbatim and that its Scripture words and
  punctuation are not modified.
- Preserve the World English Bible trademark qualification.
- Identify the exact upstream filenames for the four non-English public-domain
  claims sourced from `seven1m/open-bibles`.
- Mark the Ostervald 1996 independent rights review as pending.
- Keep a lawyer-review reminder; this change records evidence and is not legal
  advice.

## Testing

A small Node test must verify that:

- all six edition names occur in the Terms;
- YTC contains its copyright, CC BY-ND 4.0 label, and official source;
- the Terms do not describe all Scripture as World English Bible or public
  domain;
- Ostervald 1996 carries the pending-verification warning;
- the hosted Terms mirror contains the same Scripture disclosure.

The full suite, typecheck, lint, and Android export must remain green. A scope
check must prove that no Scripture data path changed.

