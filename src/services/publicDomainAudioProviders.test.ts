import assert from 'node:assert/strict';
import test from 'node:test';
import { extractTrustedMp3Urls, resolveEbibleChapterUrl, resolveSermonOnlineChapterUrl } from './publicDomainAudioProviders.ts';

test('keeps only ordered HTTPS audio from the configured host', () => {
  const html = '<a href="01001-one.mp3">a</a><a href="https://evil.example/x.mp3">x</a><a href="01002-two.mp3">b</a>';
  assert.deepEqual(extractTrustedMp3Urls(html, 'https://info2.sermon-online.com/audio/'), [
    'https://info2.sermon-online.com/audio/01001-one.mp3',
    'https://info2.sermon-online.com/audio/01002-two.mp3',
  ]);
});

test('builds exact eBible chapter URLs', () => {
  assert.equal(resolveEbibleChapterUrl('turytc', 0, 0), 'https://ebible.org/turytc/mp3/GEN01.mp3');
  assert.equal(resolveEbibleChapterUrl('turytc', 65, 21), 'https://ebible.org/turytc/mp3/REV22.mp3');
});

test('selects the exact Sermon Online book and chapter', async () => {
  const fetcher = async () => new Response('<a href="40001-Mat-001.mp3">a</a><a href="40002-Mat-002.mp3">b</a>');
  assert.equal(await resolveSermonOnlineChapterUrl('https://info2.sermon-online.com/audio/', 39, 1, fetcher), 'https://info2.sermon-online.com/audio/40002-Mat-002.mp3');
});
