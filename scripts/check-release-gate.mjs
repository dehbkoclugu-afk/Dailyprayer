/**
 * Scripture rights release gate (roadmap item 10).
 *
 * A locale whose Scripture rights are not established must not reach users. This
 * script fails the release while such a locale is still bundled, so the block is
 * enforced by tooling rather than by remembering a caveat in a document.
 *
 * It deliberately does NOT run as part of `npm test` — day-to-day development
 * stays green while the release stays blocked.
 *
 *   npm run release-gate
 *
 * Exit 0 = every shipped Scripture edition has verified rights.
 * Exit 1 = release blocked; the report says which locale and why.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SCRIPTURE_SOURCES,
  RELEASE_BLOCKED_LOCALES,
  claimsFreeRights,
} from '../src/data/scriptureRights.ts';

const DATA_DIR = new URL('../src/data/', import.meta.url).pathname;
const failures = [];
const notes = [];

// 1. A bundled edition with unverified rights is a distribution risk.
for (const locale of RELEASE_BLOCKED_LOCALES) {
  const source = SCRIPTURE_SOURCES[locale];
  const bundled = join(DATA_DIR, `bible-full.${locale}.json`);
  if (existsSync(bundled)) {
    failures.push(
      `[${locale}] ${source.edition} ships in bible-full.${locale}.json but its rights are unverified.\n` +
        `        Basis: ${source.basis}`,
    );
  }
}

// 2. No credit line may assert free rights for an edition we have not verified.
for (const [locale, source] of Object.entries(SCRIPTURE_SOURCES)) {
  if (source.status === 'unverified' && claimsFreeRights(source.credit)) {
    failures.push(
      `[${locale}] credit claims free rights for an unverified edition: "${source.credit}"`,
    );
  }
  if (!source.reviewed || !source.basis) {
    failures.push(`[${locale}] registry entry is missing review evidence.`);
  }
}

// 3. Report stale claims still frozen inside the immutable Scripture JSON.
for (const [locale, source] of Object.entries(SCRIPTURE_SOURCES)) {
  const bundled = join(DATA_DIR, `bible-full.${locale}.json`);
  if (!existsSync(bundled)) continue;
  const { credit } = JSON.parse(readFileSync(bundled, 'utf8'));
  if (credit !== source.credit) {
    notes.push(
      `[${locale}] bundled JSON credit "${credit}" is superseded by the registry ` +
        `"${source.credit}" (JSON is immutable Scripture source data; the app shows the registry).`,
    );
  }
}

if (notes.length) {
  console.log('Notes:');
  for (const note of notes) console.log(`  - ${note}`);
  console.log('');
}

if (failures.length) {
  console.error(`Scripture rights release gate FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(
    '\nResolve each blocked locale before release: obtain written permission from the\n' +
      'rights holder, replace the text with a verified public-domain edition of the same\n' +
      'language, or remove the locale from the build. Record the outcome in\n' +
      'docs/scripture-sources.md and update src/data/scriptureRights.ts.',
  );
  process.exit(1);
}

console.log('Scripture rights release gate passed — every shipped edition has verified rights.');
