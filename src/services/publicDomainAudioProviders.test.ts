import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearPublicDomainAudioCache,
  extractTrustedMp3Urls,
  resolveEbibleChapterUrl,
  resolveSermonOnlineChapterUrl,
  resolveSpanishChapterUrl,
} from './publicDomainAudioProviders.ts';

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

test('selects Spanish audio by canonical book and chapter instead of catalog position', async () => {
  clearPublicDomainAudioCache();
  const page = [
    '"https://www.publicdomainaudiobibles.com/playlist/54_RVA_1T.xml"',
    '"https://www.publicdomainaudiobibles.com/playlist/52_RVA_T.xml"',
    '"https://www.publicdomainaudiobibles.com/playlist/66_RVA_A.xml"',
  ].join(' ');
  const playlist = [
    '<li data-path="content/mp3/RVA1909/53_2Ts003.mp3">wrong chapter</li>',
    '<li data-path="content/mp3/RVA1909/52_1Ts001.mp3">wrong book</li>',
    '<li data-path="content/mp3/RVA1909/53_2Ts002.mp3">exact</li>',
  ].join('');
  const requested: string[] = [];
  const fetcher = async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    return new Response(url.endsWith('RVA1909.html') ? page : playlist);
  };

  assert.equal(
    await resolveSpanishChapterUrl(52, 1, fetcher as typeof fetch),
    'https://publicdomainaudiobibles.com/content/mp3/RVA1909/53_2Ts002.mp3',
  );
  assert.equal(requested[1], 'https://www.publicdomainaudiobibles.com/playlist/52_RVA_T.xml');
  clearPublicDomainAudioCache();
});

test('rejects invalid Spanish audio coordinates before fetching', async () => {
  await assert.rejects(() => resolveSpanishChapterUrl(66, 0), /Invalid audio chapter/);
});
