import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bundledScriptureSource,
  downloadedScriptureSource,
  isHttpsScriptureUrl,
} from './scriptureSource.ts';
import type { BiblePack } from './biblePack.ts';

test('bundled source metadata preserves exact edition rights and credit', () => {
  const ytc = bundledScriptureSource('tr', 'YTC credit');
  assert.equal(ytc.edition, 'Yorumsuz Türkçe Çeviri (YTC)');
  assert.match(ytc.rights ?? '', /CC BY-ND 4\.0/);
  assert.equal(ytc.credit, 'YTC credit');
  assert.equal(ytc.sourceUrl, 'https://ebible.org/turytc/copyright.htm');
  assert.equal(ytc.licenseUrl, 'https://creativecommons.org/licenses/by-nd/4.0/');

  const web = bundledScriptureSource('en', 'WEB credit');
  assert.equal(web.edition, 'World English Bible');
  assert.match(web.rights ?? '', /Public domain/);
});

test('downloaded source uses validated pack metadata without inventing rights', () => {
  const pack = {
    edition: 'Named upstream edition',
    credit: 'Exact upstream credit',
    sourceUrl: 'https://example.com/source',
  } as unknown as BiblePack;
  const source = downloadedScriptureSource(pack);
  assert.deepEqual(source, {
    edition: 'Named upstream edition',
    credit: 'Exact upstream credit',
    sourceUrl: 'https://example.com/source',
  });
  assert.equal(source.rights, undefined);
});

test('only HTTPS source and license links are accepted', () => {
  assert.equal(isHttpsScriptureUrl('https://example.com/source'), true);
  assert.equal(isHttpsScriptureUrl('http://example.com/source'), false);
  assert.equal(isHttpsScriptureUrl('javascript:alert(1)'), false);
  assert.equal(isHttpsScriptureUrl(undefined), false);
});
