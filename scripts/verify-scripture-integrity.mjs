#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const expected = {
  en: '99213d02de0b38dc3b87085af5b26bb90f314646e02b6862498a762a980cc160',
  tr: 'd757feb4e32f2059750d34804569a5ee7be65952a28c6463f7fcfdedc0135ab1',
  es: '8591b6aaf8939d9c451d4677355244e0e5a9c79fdb860985c8c2c3adc48a0c35',
  pt: 'f9c4527f7c009494bfdad0ca57a5d9588c98e87e29ff25336e8e9a8041033708',
  fr: '2e6d48e7272828ffc736c2b196699e0429ba1d56152708e8dca32bac8f1e7e0c',
  de: '003cf8e9caa2d4c1f104ad5f6bdcb7be474ba63837fe4f8213639b7878159c4a',
};

for (const [locale, digest] of Object.entries(expected)) {
  const file = `src/data/bible-full.${locale}.json`;
  const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (actual !== digest) {
    throw new Error(`${file} changed (${actual}); verify the exact source and update docs/scripture-sources.md before accepting it`);
  }
}

console.log(`Scripture integrity verified: ${Object.keys(expected).length} immutable source files`);
