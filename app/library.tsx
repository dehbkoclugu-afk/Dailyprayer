import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { ArtSlot } from '@/components/ArtSlot';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { HIGHLIGHT_SWATCH } from '@/theme/highlights';
import { getBible } from '@/data/bibleFull';
import { findBookIndex, findVerseIndex, parseHighlightKey } from '@/data/bibleNav';
import { truncate } from '@/lib/text';
import { useBookmarkStore, type Bookmark } from '@/state/useBookmarkStore';
import { toast } from '@/state/useToastStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { useT } from '@/i18n';
import { useJournalStore } from '@/state/useJournalStore';
import { TopAppBar } from '@/components/TopAppBar';
import { useScriptureLocale } from '@/i18n/scripture';

type Tab = 'bookmarks' | 'highlights' | 'journal';

interface Row {
  key: string;
  code: string;
  chapter: number;
  /** verse label ("16") or legacy "#index" */
  verse: string;
  ref: string;
  bookmark?: Bookmark;
  preview: string;
  color?: string;
  markKey?: string;
  journalId?: string;
}

export default function Library() {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const scriptureLocale = useScriptureLocale();
  const [tab, setTab] = useState<Tab>('bookmarks');

  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.remove);
  const restoreBookmark = useBookmarkStore((s) => s.restore);
  const marks = useHighlightStore((s) => s.marks);
  const clearMark = useHighlightStore((s) => s.clear);
  // Every entry is the user's own writing (including legacy prayer requests).
  const journalEntries = useJournalStore((s) => s.entries);
  const removeJournal = useJournalStore((s) => s.remove);
  const restoreJournal = useJournalStore((s) => s.restore);

  const bookmarkRows = useMemo<Row[]>(
    () =>
      bookmarks.map((m) => ({
        key: `b:${m.code}|${m.chapter}|${m.verse}`,
        code: m.code,
        chapter: m.chapter,
        verse: m.verse,
        ref: m.ref,
        preview: m.preview,
        bookmark: m,
      })),
    [bookmarks],
  );

  // Highlights render from the edition the reader shows, in canonical order.
  const highlightRows = useMemo<Row[]>(() => {
    const bible = getBible(scriptureLocale);
    const rows: (Row & { order: [number, number, number] })[] = [];
    for (const [key, color] of Object.entries(marks)) {
      const address = parseHighlightKey(key);
      if (!address) continue;
      const b = findBookIndex(bible, address.code);
      if (b < 0) continue;
      const ch = bible[b].chapters[address.chapter];
      const v = findVerseIndex(ch, address.verse);
      if (v < 0) continue;
      const [label, text] = ch[v];
      rows.push({
        key: `h:${key}`,
        code: address.code,
        chapter: address.chapter,
        verse: label,
        ref: `${bible[b].name} ${address.chapter + 1}:${label}`,
        preview: truncate(text, 90),
        color: HIGHLIGHT_SWATCH[color],
        markKey: key,
        order: [b, address.chapter, v],
      });
    }
    return rows.sort(
      (x, y) => x.order[0] - y.order[0] || x.order[1] - y.order[1] || x.order[2] - y.order[2],
    );
  }, [marks, scriptureLocale]);

  const journalRows = useMemo<Row[]>(() => journalEntries.map((entry) => ({
    key: `j:${entry.id}`,
    code: '',
    chapter: -1,
    verse: '',
    ref: entry.ref ?? entry.day,
    preview: entry.text,
    journalId: entry.id,
  })), [journalEntries]);

  // Every removal can be undone from the toast.
  const removeRow = (item: Row) => {
    if (item.journalId) {
      const entry = journalEntries.find((candidate) => candidate.id === item.journalId);
      removeJournal(item.journalId);
      if (entry) toast(tr('a11y.deleteEntry'), tr('today.undo'), () => restoreJournal(entry));
      return;
    }
    if (item.markKey) {
      const key = item.markKey;
      const color = marks[key];
      clearMark(key);
      toast(tr('toast.highlightOff'), tr('today.undo'), () => useHighlightStore.getState().set(key, color));
      return;
    }
    if (!item.bookmark) return;
    const removed = item.bookmark;
    removeBookmark(removed);
    toast(tr('verse.bookmarkRemoved'), tr('today.undo'), () => restoreBookmark(removed));
  };

  const rows = tab === 'bookmarks' ? bookmarkRows : tab === 'highlights' ? highlightRows : journalRows;

  const segment = (key: Tab, label: string, count: number) => {
    const active = tab === key;
    return (
      <Pressable
        onPress={() => setTab(key)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          minHeight: 48,
          paddingVertical: 9,
          borderRadius: radius.pill,
          backgroundColor: active ? t.gold : 'transparent',
        }}
      >
        <Text numberOfLines={2} style={{ ...ty.label, flexShrink: 1, textAlign: 'center', color: active ? t.onGold : t.inkSoft }}>
          {label}
        </Text>
        <Text
          style={{
            ...ty.labelSmallBold,
            color: active ? t.onGold : t.inkFaint,
            fontVariant: ['tabular-nums'],
          }}
        >
          {count}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.md }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <TopAppBar title={tr('library.title')} />
      </View>

      {/* segmented control */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: t.surface,
          borderRadius: radius.pill,
          padding: 4,
          marginHorizontal: spacing.xl,
          marginTop: spacing.lg,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        {segment('bookmarks', tr('library.bookmarks'), bookmarkRows.length)}
        {segment('highlights', tr('library.highlights'), highlightRows.length)}
        {segment('journal', tr('journal.entries'), journalRows.length)}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl, paddingHorizontal: spacing.xl }}>
            <Ionicons name={tab === 'bookmarks' ? 'bookmark-outline' : tab === 'highlights' ? 'color-fill-outline' : 'journal-outline'} size={40} color={t.inkFaint} />
            <Text
              style={{
                ...ty.editorialCompact,
                color: t.inkSoft,
                textAlign: 'center',
                marginTop: spacing.lg,
                maxWidth: 280,
              }}
            >
              {tab === 'journal' ? tr('journal.empty') : tr('library.empty')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => item.journalId
              ? router.push('/(tabs)/journal')
              : router.push({ pathname: '/read', params: { b: item.code, c: item.chapter, v: item.verse } })}
            accessibilityRole="button"
            accessibilityLabel={item.ref}
            style={({ pressed }) => ({
              backgroundColor: t.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: t.border,
              overflow: 'hidden',
              marginBottom: spacing.md,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <ArtSlot id="A18-ritual-reading" scrim="readable" radius={radius.card} style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, minHeight: 84 }}>
                {item.color ? (
                  <View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: item.color }} />
                ) : (
                  <Ionicons name={item.journalId ? 'journal' : 'bookmark'} size={18} color={t.gold} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ ...ty.label, color: t.gold }}>{item.ref}</Text>
                  <Text
                    style={{ ...ty.editorialSecondary, color: artwork.foreground.secondary, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {item.preview}
                  </Text>
                </View>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    removeRow(item);
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.journalId ? tr('a11y.deleteEntry') : item.markKey ? tr('verse.removeHighlight') : tr('library.removeBookmark')}: ${item.ref}`}
                  style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={18} color={artwork.foreground.tertiary} />
                </Pressable>
              </View>
            </ArtSlot>
          </Pressable>
        )}
      />
    </View>
  );
}
