import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('expanded layouts use a rail and multi-column content', () => {
  const tabs = read('app/(tabs)/_layout.tsx');
  const screen = read('src/components/Screen.tsx');
  const today = read('app/(tabs)/today.tsx');
  const bible = read('app/(tabs)/bible.tsx');

  assert.match(tabs, /tabBarPosition: expanded \? 'left' : 'bottom'/);
  assert.match(tabs, /width: expanded \? 96 : undefined/);
  assert.match(screen, /width >= 840 \? 1120 : 480/);
  assert.match(today, /width: expanded \? '48\.8%' : '100%'/);
  assert.match(bible, /width: expanded \? '48\.8%' : '100%'/);
});

test('secondary screens share one top app bar and Android predictive back is enabled', () => {
  const app = read('app.json');
  for (const file of ['app/search.tsx', 'app/library.tsx', 'app/plan/[id]/[day].tsx', 'app/devotional.tsx', 'app/legal.tsx']) {
    assert.match(read(file), /<TopAppBar title=/, `${file} does not use TopAppBar`);
  }
  assert.match(app, /"predictiveBackGestureEnabled": true/);
});

test('reader position, grouped picker, current chapter, overflow and first-use hint stay connected', () => {
  const store = read('src/state/useReaderStore.ts');
  const reader = read('app/read.tsx');
  const prefs = read('src/state/useReaderPrefsStore.ts');

  assert.match(store, /verse: number/);
  assert.match(reader, /onViewableItemsChanged=\{onViewableItemsChanged\}/);
  assert.match(reader, /read\.oldTestament/);
  assert.match(reader, /read\.newTestament/);
  assert.match(reader, /placeholder=\{tr\('read\.pickBookSearch'\)\}/);
  assert.match(reader, /chapterRef\.current\?\.scrollToIndex/);
  assert.match(reader, /compact[\s\S]*?ellipsis-horizontal/);
  assert.match(reader, /readerHintSeen/);
  assert.match(prefs, /dismissReaderHint/);
});

test('search, library and plan completion expose their narrowing and continuation paths', () => {
  const search = read('app/search.tsx');
  const library = read('app/library.tsx');
  const day = read('app/plan/[id]/[day].tsx');

  assert.match(search, /type BookFilter = 'all' \| 'old' \| 'new' \| number/);
  assert.match(search, /searchScripture\(bible, q, bookFilter, MAX\)/);
  const searchWorker = read('src/data/scriptureSearch.ts');
  assert.match(searchWorker, /filter === 'old'/);
  assert.match(searchWorker, /await yieldToUI\(\)/);
  assert.match(search, /read\.firstResults/);
  assert.match(search, /numberOfLines=\{2\}/);
  assert.match(library, /type Tab = 'bookmarks' \| 'highlights' \| 'journal'/);
  assert.match(library, /segment\('journal'/);
  assert.match(day, /plan\.nextDay/);
  assert.match(day, /router\.replace\(\{/);
});

test('Today prioritizes the next step and Pray exposes the six illustrated categories', () => {
  const today = read('app/(tabs)/today.tsx');
  const ritual = read('src/components/RitualCard.tsx');
  const pray = read('app/(tabs)/pray.tsx');

  assert.match(today, /const nextStep =/);
  assert.match(today, /primary=\{nextStep === 'devotional'\}/);
  assert.match(today, /compact=\{isDone\('devotional'\)\}/);
  assert.match(today, /today\.progressSummary/);
  assert.match(today, /height=\{evening \? 150 : 96\}/);
  assert.match(ritual, /today\.nextStep/);
  assert.match(pray, /prayerCategories\.map/);
  assert.match(pray, /categoryArt\(c\.key\)/);
  assert.match(pray, /flexWrap: 'wrap'/);
});
