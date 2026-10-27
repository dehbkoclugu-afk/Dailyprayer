import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, InteractionManager, Modal, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/theme/typography';
import { radius, spacing, art } from '@/theme/tokens';
import { HIGHLIGHT_TINT, type HighlightColor } from '@/theme/highlights';
import { useReaderTheme, type ReaderTheme } from '@/theme/reading';
import type { Chapter, FullBook } from '@/data/bibleFull';
import { useBible } from '@/hooks/useBible';
import { goBack } from '@/lib/navigation';
import { findBookIndex, findVerseIndex, highlightKey, resolveReaderTarget } from '@/data/bibleNav';
import { splitDropCap } from '@/lib/text';
import { useReaderStore } from '@/state/useReaderStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { ReadingSettingsSheet } from '@/components/ReadingSettingsSheet';
import { VerseActionSheet, type SelectedVerse } from '@/components/VerseActionSheet';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { RTL_LOCALE_TAGS } from '@/i18n/globalLanguageCatalog';

interface VerseRowProps {
  label: string;
  text: string;
  index: number;
  first: boolean;
  tint: string;
  flashed: boolean;
  rtl: boolean;
  fontScale: number;
  theme: ReaderTheme;
  onOpen: (index: number) => void;
  onQuickHighlight: (index: number) => void;
}

/** Memoized so highlighting one verse doesn't re-render the whole chapter. */
const VerseRow = memo(function VerseRow({
  label,
  text,
  index,
  first,
  tint,
  flashed,
  rtl,
  fontScale,
  theme: rt,
  onOpen,
  onQuickHighlight,
}: VerseRowProps) {
  const bodySize = Math.round(18 * fontScale);
  const bodyLine = Math.round(30 * fontScale);
  const dropCapSize = Math.round(bodySize * 1.9);
  const style = {
    fontFamily: fonts.serifLight,
    fontSize: bodySize,
    lineHeight: first ? dropCapSize : bodyLine,
    color: rt.ink,
    marginBottom: spacing.sm,
    backgroundColor: flashed ? rt.goldSoft : tint,
    borderRadius: 6,
    textAlign: rtl ? 'right' : 'left',
    writingDirection: rtl ? 'rtl' : 'ltr',
  } as const;
  const number = (
    <Text style={{ fontFamily: fonts.sansBold, fontSize: Math.round(11 * fontScale), color: rt.gold }}>
      {label}
      {'  '}
    </Text>
  );

  if (first) {
    const { lead, cap, rest } = splitDropCap(text);
    return (
      <Text
        onPress={() => onOpen(index)}
        onLongPress={() => onQuickHighlight(index)}
        suppressHighlighting
        accessibilityHint={label}
        style={style}
      >
        {number}
        {lead}
        <Text style={{ fontFamily: fonts.serif, fontSize: dropCapSize, color: rt.gold }}>{cap}</Text>
        {rest}
      </Text>
    );
  }

  return (
    <Text
      onPress={() => onOpen(index)}
      onLongPress={() => onQuickHighlight(index)}
      suppressHighlighting
      style={style}
    >
      {number}
      {text}
    </Text>
  );
});

export default function Read() {
  const scriptureLocale = useScriptureLocale();
  const bible = useBible(scriptureLocale);
  const rt = useReaderTheme();
  if (!bible) {
    return (
      <View style={{ flex: 1, backgroundColor: rt.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={rt.gold} />
      </View>
    );
  }
  return <Reader bible={bible} />;
}

function Reader({ bible }: { bible: FullBook[] }) {
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const scriptureRtl = RTL_LOCALE_TAGS.includes(scriptureLocale);
  const insets = useSafeAreaInsets();
  const bookCode = useReaderStore((s) => s.bookCode);
  const chapter = useReaderStore((s) => s.chapter);
  const setPos = useReaderStore((s) => s.setPos);
  const fontScale = useReaderPrefsStore((s) => s.fontScale);
  const marks = useHighlightStore((s) => s.marks);
  const setMark = useHighlightStore((s) => s.set);
  const clearMark = useHighlightStore((s) => s.clear);
  const params = useLocalSearchParams<{ b?: string; c?: string; v?: string }>();

  // reading palette: paper override folded over the app theme
  const rt = useReaderTheme();

  const [picker, setPicker] = useState<null | 'books' | number>(null);
  const [settings, setSettings] = useState(false);
  const [selected, setSelected] = useState<SelectedVerse | null>(null);
  const [flashV, setFlashV] = useState<number | null>(null);
  const [pendingVerse, setPendingVerse] = useState<number | null>(null);
  const listRef = useRef<FlatList<Chapter[number]>>(null);

  const foundBook = findBookIndex(bible, bookCode);
  const bIdx = foundBook >= 0 ? foundBook : 0;
  const bk = bible[bIdx];
  const cIdx = Math.max(0, Math.min(chapter, bk.chapters.length - 1));
  const verses = bk.chapters[cIdx];

  // Deep navigation (/read?b=<code|index>&c=<chapter>&v=<verse label>) from
  // search, the library and plans. Params are untrusted: invalid ones are
  // ignored, and a verse target is consumed once so it doesn't re-fire on
  // every later chapter change.
  useEffect(() => {
    const target = resolveReaderTarget(bible, { book: params.b, chapter: params.c, verse: params.v });
    if (!target) return;
    setPos(bible[target.book].code, target.chapter);
    setPendingVerse(target.verse);
    router.setParams({ b: undefined, c: undefined, v: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.b, params.c, params.v]);

  useEffect(() => {
    if (pendingVerse == null) return;
    const index = Math.min(pendingVerse, verses.length - 1);
    let clearFlash: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      listRef.current?.scrollToIndex({ index, viewPosition: 0.28, animated: true });
      setFlashV(index);
      setPendingVerse(null);
      clearFlash = setTimeout(() => setFlashV(null), 2200);
    });
    return () => {
      task.cancel();
      if (clearFlash) clearTimeout(clearFlash);
    };
  }, [pendingVerse, verses.length]);

  const go = (b: number, c: number) => {
    setPos(bible[b].code, c);
    setPicker(null);
  };
  const next = () => {
    if (cIdx + 1 < bk.chapters.length) go(bIdx, cIdx + 1);
    else if (bIdx + 1 < bible.length) go(bIdx + 1, 0);
  };
  const prev = () => {
    if (cIdx > 0) go(bIdx, cIdx - 1);
    else if (bIdx > 0) go(bIdx - 1, bible[bIdx - 1].chapters.length - 1);
  };
  const hasNext = cIdx + 1 < bk.chapters.length || bIdx + 1 < bible.length;
  const hasPrev = cIdx > 0 || bIdx > 0;
  const bodyLine = Math.round(30 * fontScale);

  const openVerse = useCallback(
    (index: number) => {
      const [label, text] = verses[index];
      setSelected({
        code: bk.code,
        chapter: cIdx,
        verse: label,
        ref: `${bk.name} ${cIdx + 1}:${label}`,
        text,
      });
    },
    [bk.code, bk.name, cIdx, verses],
  );

  const quickHighlight = useCallback(
    (index: number) => {
      // long-press is the quick path: highlight (or un-highlight) in place,
      // no menu. A short tap opens the full action sheet.
      Haptics.selectionAsync().catch(() => {});
      const key = highlightKey(bk.code, cIdx, verses[index][0]);
      if (useHighlightStore.getState().marks[key]) clearMark(key);
      else setMark(key, 'gold');
    },
    [bk.code, cIdx, clearMark, setMark, verses],
  );

  // Marks resolve by label, falling back to legacy "#index" keys.
  const tintFor = useMemo(() => {
    const byIndex = new Map<number, HighlightColor>();
    const prefix = `${bk.code}|${cIdx}|`;
    for (const [key, color] of Object.entries(marks)) {
      if (!key.startsWith(prefix)) continue;
      const index = findVerseIndex(verses, key.slice(prefix.length));
      if (index >= 0) byIndex.set(index, color);
    }
    return byIndex;
  }, [bk.code, cIdx, marks, verses]);

  const iconBtn = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: rt.surface,
        borderWidth: 1,
        borderColor: rt.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={rt.inkSoft} />
    </Pressable>
  );

  const navBtn = (dir: 'prev' | 'next', enabled: boolean, onPress: () => void, label: string) => (
    <Pressable
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: rt.surface,
        borderWidth: 1,
        borderColor: rt.border,
        borderRadius: radius.pill,
        paddingVertical: 12,
        minHeight: 48,
        opacity: enabled ? 1 : 0.4,
      }}
    >
      {dir === 'prev' ? <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={16} color={rt.inkSoft} /> : null}
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: rt.inkSoft }}>{label}</Text>
      {dir === 'next' ? <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={16} color={rt.inkSoft} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: rt.bg, paddingTop: insets.top + spacing.md }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl }}>
        <Pressable
          onPress={() => goBack('/(tabs)/bible')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: rt.surface,
            borderWidth: 1,
            borderColor: rt.border,
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={rt.inkSoft} />
        </Pressable>
        <Pressable
          onPress={() => setPicker('books')}
          accessibilityRole="button"
          accessibilityLabel={`${tr('read.pickBook')}: ${bk.name} ${cIdx + 1}`}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: rt.surface,
            borderWidth: 1,
            borderColor: rt.border,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            height: 44,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: rt.ink, flexShrink: 1 }} numberOfLines={1}>
            {bk.name} {cIdx + 1}
          </Text>
          <Ionicons name="chevron-down" size={18} color={rt.inkFaint} />
        </Pressable>
        {iconBtn('search', tr('a11y.search'), () => router.push('/search'))}
        {iconBtn('text', tr('a11y.readingSettings'), () => setSettings(true))}
      </View>

      <FlatList
        ref={listRef}
        key={`${bk.code}-${cIdx}`}
        data={verses}
        keyExtractor={(item, i) => `${i}:${item[0]}`}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        windowSize={11}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({ offset: index * (averageItemLength || bodyLine * 2), animated: false });
          setTimeout(() => {
            if (index < verses.length) {
              listRef.current?.scrollToIndex({ index, viewPosition: 0.28, animated: true });
            }
          }, 120);
        }}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                fontFamily: fonts.sansSemiBold,
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                color: rt.gold,
                textAlign: scriptureRtl ? 'right' : 'left',
                writingDirection: scriptureRtl ? 'rtl' : 'ltr',
              }}
            >
              {tr('read.chapter')} {cIdx + 1}
            </Text>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: fonts.serif,
                fontSize: Math.round(30 * fontScale),
                color: rt.ink,
                marginTop: 4,
                textAlign: scriptureRtl ? 'right' : 'left',
                writingDirection: scriptureRtl ? 'rtl' : 'ltr',
              }}
            >
              {bk.name}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const color = tintFor.get(index);
          return (
            <VerseRow
              label={item[0]}
              text={item[1]}
              index={index}
              first={index === 0}
              tint={color ? HIGHLIGHT_TINT[color] : 'transparent'}
              flashed={flashV === index}
              rtl={scriptureRtl}
              fontScale={fontScale}
              theme={rt}
              onOpen={openVerse}
              onQuickHighlight={quickHighlight}
            />
          );
        }}
        ListFooterComponent={
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            {navBtn('prev', hasPrev, prev, tr('read.prev'))}
            {navBtn('next', hasNext, next, tr('read.next'))}
          </View>
        }
      />

      {/* book / chapter picker */}
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: art.scrim }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setPicker(null)}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.close')}
          />
          <View
            style={{
              maxHeight: '72%',
              backgroundColor: rt.surface,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: rt.border,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + spacing.lg,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: rt.border,
                marginBottom: spacing.md,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.lg,
                marginBottom: spacing.sm,
              }}
            >
              {typeof picker === 'number' ? (
                <Pressable
                  onPress={() => setPicker('books')}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.back')}
                  style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                >
                  <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={22} color={rt.inkSoft} />
                </Pressable>
              ) : null}
              <Text accessibilityRole="header" style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: rt.ink }}>
                {typeof picker === 'number' ? bible[picker].name : tr('read.pickBook')}
              </Text>
            </View>

            {picker === 'books' ? (
              <FlatList
                data={bible}
                keyExtractor={(b) => b.code}
                initialScrollIndex={bIdx > 3 ? bIdx - 3 : 0}
                getItemLayout={(_, index) => ({ length: 53, offset: 53 * index, index })}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => setPicker(index)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    accessibilityState={{ selected: index === bIdx }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: 53,
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: rt.border,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: index === bIdx ? fonts.sansSemiBold : fonts.sans,
                        fontSize: 16,
                        color: index === bIdx ? rt.gold : rt.ink,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={16} color={rt.inkFaint} />
                  </Pressable>
                )}
              />
            ) : typeof picker === 'number' ? (
              <FlatList
                key="chapters"
                data={bible[picker].chapters}
                keyExtractor={(_, i) => String(i)}
                numColumns={5}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                columnWrapperStyle={{ gap: spacing.sm }}
                renderItem={({ index }) => {
                  const active = picker === bIdx && index === cIdx;
                  return (
                    <Pressable
                      onPress={() => go(picker as number, index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${bible[picker as number].name} ${index + 1}`}
                      accessibilityState={{ selected: active }}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        maxWidth: 64,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? rt.goldSoft : rt.surfaceAlt,
                        borderWidth: 1,
                        borderColor: active ? rt.gold : rt.border,
                        borderRadius: radius.inner,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.sansMedium,
                          fontSize: 15,
                          color: active ? rt.gold : rt.ink,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {index + 1}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      <ReadingSettingsSheet visible={settings} onClose={() => setSettings(false)} />
      <VerseActionSheet verse={selected} onClose={() => setSelected(null)} />
    </View>
  );
}
