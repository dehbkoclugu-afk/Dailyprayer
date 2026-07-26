/**
 * Rights registry for the six bundled Scripture editions — the single source of
 * truth for what Lumen may claim about each text and which locales are allowed
 * through the release gate.
 *
 * Why this exists: the generators hard-code an attribution line into every
 * `bible-full.<locale>.json`, so a rights claim used to be able to reach users
 * without anyone verifying it — which is how an unverified "public domain" claim
 * shipped for French and Portuguese. Rights now live here and `getBibleCredit()`
 * reads this registry, never the JSON `credit` field, so a claim cannot enter the
 * app without an entry that states its evidence and passes the release gate.
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
      'The copyright holder states the copyright and CC BY-ND 4.0 terms on its own official page. Re-exported verbatim from the 2026-07-26 upstream artifact.',
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
    edition: 'Bíblia Livre (updated from the 1819 Almeida, Textus Receptus edition)',
    status: 'licensed',
    credit: 'Bíblia Livre © Diego Santos, Mario Sérgio e Marco Teles · CC BY 4.0',
    copyright: '© 2018 Diego Santos, Mario Sérgio, e Marco Teles',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    conditions:
      'Include the copyright and source information, and mark any change to the text so the original licensor is not shown as endorsing it.',
    sourceUrl: 'https://ebible.org/porbr2018/copyright.htm',
    reviewed: '2026-07-26',
    basis:
      'Replaced the unidentified Almeida file on 2026-07-26. eBible.org publishes the copyright holders and CC BY 4.0 terms, and the rights holders state their own attribution requirement, so both the edition and its license are established.',
  },
  fr: {
    edition: 'La Sainte Bible (Ostervald)',
    status: 'public-domain',
    credit: 'La Sainte Bible (Ostervald) · Domaine public',
    sourceUrl: 'https://ebible.org/fra_fob/copyright.htm',
    reviewed: '2026-07-26',
    basis:
      'Replaced the Ostervald 1996 file on 2026-07-26, whose 1996 editorial layer had an identifiable publisher and no public-domain dedication. This edition is published by eBible.org with an authoritative public-domain notice and predates that layer.',
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
