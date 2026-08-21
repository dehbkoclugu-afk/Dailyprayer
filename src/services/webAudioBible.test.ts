import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearWebAudioCache,
  extractWebAudioUrls,
  resolveWebAudioChapterUrl,
  WEB_AUDIO_BOOK_DIRECTORIES,
} from './webAudioBible.ts';

test('maps all 66 books in canonical order', () => {
  assert.equal(WEB_AUDIO_BOOK_DIRECTORIES.length, 66);
  assert.equal(WEB_AUDIO_BOOK_DIRECTORIES[0], '01_Genesis');
  assert.equal(WEB_AUDIO_BOOK_DIRECTORIES[65], '66_Revelations');
});

test('keeps ordered mp3 links on the trusted eBible directory only', () => {
  const html = `<a href="01.mp3">one</a><a href="https://evil.example/fake.mp3">fake</a><a href="../outside.mp3">outside</a><a href="02.mp3">two</a>`;
  assert.deepEqual(extractWebAudioUrls(html, '01_Genesis'), [
    'https://ebible.org/eng-web/audio/01_Genesis/01.mp3',
    'https://ebible.org/eng-web/audio/01_Genesis/02.mp3',
  ]);
});

test('resolves a chapter without bundling audio', async () => {
  clearWebAudioCache();
  const fetcher = async () => new Response('<a href="a.mp3">1</a><a href="b.mp3">2</a>');
  assert.equal(await resolveWebAudioChapterUrl(39, 1, fetcher), 'https://ebible.org/eng-web/audio/40_Matthew/b.mp3');
});
