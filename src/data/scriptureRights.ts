/**
 * Rights registry for the six bundled Scripture editions — the single source of
 * truth for what Lumen may claim about each text and which locales are allowed
 * through the release gate.
 *
 * Why this exists: `scripts/build-bible-i18n.mjs` hard-coded an attribution line
 * into every `bible-full.<locale>.json`, including a "public domain" claim for
 * French and Portuguese that the evidence does not support. The bundled JSON is
 * immutable source data (see `docs/scripture-integrity.md`), so the claim is
 * corrected here at the presentation layer instead of by rewriting Scripture
 * files: `getBibleCredit()` reads this registry, never the JSON `credit` field.
 *
 * Evidence and verdicts: `docs/scripture-sources.md`.
 */
import type { Locale } from '@/i18n/translations';

export type RightsStatus =
  /** Verified public domain — reviewed evidence supports the claim. */
  | 'public-domain'
  /** Under copyright, distributed under a verified license we comply with. */
  | 'licensed'
  /** Rights or edition identity not established. Must never be called free. */
  | 'unverified';

export interface ScriptureSource {
  /** Exact edition name. Never a generic language label. */
  edition: string;
  status: RightsStatus;
  /** Attribution line shown under the reader. Must match `status`. */
  credit: string;
  copyright?: string;
  license?: string;
  licenseUrl?: string;
  /** Conditions we must honor when distributing the text. */
  conditions?: string;
  /** The artifact the bundled text was built from. */
  sourceUrl: string;
  /** Date the rights evidence was last reviewed (ISO). */
  reviewed: string;
  /** Why the status is what it is, in one sentence. */
  basis: string;
}

export const SCRIPTURE_SOURCES: Record<Locale, ScriptureSource> = {
  tr: {
    edition: 'Yorumsuz Türkçe Çeviri (YTC)',
    status: 'licensed',
    credit: 'Yorumsuz Türkçe Çeviri © İsmail Serinken & eBible.org · CC BY-ND 4.0',
    copyright: '© 2023–2025 İsmail Serinken and eBible.org',
    license: 'CC BY-ND 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/',
    conditions:
      'Keep the copyright and source information, and do not change the words or punctuation of the Scriptures.',
    sourceUrl: 'https://ebible.org/turytc/copyright.htm',
    reviewed: '2026-07-26',
    basis:
      'The copyright holder states the copyright and CC BY-ND 4.0 terms on its own official page.',
  },
  en: {
    edition: 'World English Bible',
    status: 'public-domain',
    credit: 'World English Bible · Public Domain',
    conditions:
      '“World English Bible” is an eBible.org trademark and may identify unchanged text only.',
    sourceUrl: 'https://ebible.org/eng-web/copyright.htm',
    reviewed: '2026-07-26',
    basis: 'The publisher dedicates the WEB to the public domain in its own rights notice.',
  },
  es: {
    edition: 'Reina-Valera 1909',
    status: 'public-domain',
    credit: 'Reina-Valera 1909 · Dominio público',
    sourceUrl: 'https://github.com/seven1m/open-bibles/blob/master/spa-rv1909.usfx.xml',
    reviewed: '2026-07-26',
    basis:
      'Published in 1909 and its revisers died more than 70 years ago, so the term of protection has expired independently of any upstream label.',
  },
  pt: {
    edition: 'João Ferreira de Almeida (revision not identified)',
    status: 'unverified',
    credit: 'João Ferreira de Almeida · Edição e direitos por verificar',
    sourceUrl: 'https://github.com/seven1m/open-bibles/blob/master/por-almeida.usfx.xml',
    reviewed: '2026-07-26',
    basis:
      'The upstream artifact carries no header, no rights statement and no dated revision, and its wording does not match a single known Almeida revision, so neither the edition nor its rights status is established.',
  },
  fr: {
    edition: 'Bible J.F. Ostervald 1996',
    status: 'unverified',
    credit: 'Bible Ostervald 1996 · Droits en cours de vérification',
    sourceUrl: 'https://github.com/seven1m/open-bibles/blob/master/fra-ostervald.osis.xml',
    reviewed: '2026-07-26',
    basis:
      'The 1996 revision was edited by C. H. Boughman and published by Bearing Precious Seed (Milford, Ohio) in 1996, and no public-domain dedication from them was found; the only "public domain" label comes from a third-party software packager.',
  },
  de: {
    edition: 'Luther Bible 1912',
    status: 'public-domain',
    credit: 'Lutherbibel 1912 · Gemeinfrei',
    sourceUrl: 'https://github.com/seven1m/open-bibles/blob/master/deu-luther1912.osis.xml',
    reviewed: '2026-07-26',
    basis:
      'Published in 1912 and its revisers died more than 70 years ago, so the term of protection has expired; the upstream file only states a belief, not a determination.',
  },
};

/** Locales whose Scripture rights are established well enough to distribute. */
export function isRightsVerified(locale: Locale): boolean {
  return SCRIPTURE_SOURCES[locale].status !== 'unverified';
}

/**
 * Locales that must not ship until their Scripture rights are settled
 * (roadmap item 10). `scripts/check-release-gate.mjs` fails the release while
 * any of these is still reachable in the app.
 */
export const RELEASE_BLOCKED_LOCALES: Locale[] = (
  Object.keys(SCRIPTURE_SOURCES) as Locale[]
).filter((locale) => !isRightsVerified(locale));

/** Wording that must never describe an edition we have not verified as free. */
export const FREE_RIGHTS_CLAIMS = [
  'public domain',
  'dominio público',
  'domínio público',
  'domaine public',
  'gemeinfrei',
  'kamu malı',
];

/** True when a credit line asserts the text is free to use. */
export function claimsFreeRights(credit: string): boolean {
  const lowered = credit.toLowerCase();
  return FREE_RIGHTS_CLAIMS.some((claim) => lowered.includes(claim));
}
