import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { HIGHLIGHT_TINT } from '@/theme/highlights';
import { useReaderTheme } from '@/theme/reading';
import { getBible } from '@/data/bibleFull';
import { useReaderStore } from '@/state/useReaderStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { ReadingSettingsSheet } from '@/components/ReadingSettingsSheet';
import { VerseActionSheet, type SelectedVerse } from '@/components/VerseActionSheet';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { RTL_LOCALE_TAGS } from '@/i18n/globalLanguageCatalog';

export default function Read() {
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const scriptureRtl = RTL_LOCALE_TAGS.includes(scriptureLocale);
  const insets = useSafeAreaInsets();
  const bible = getBible(scriptureLocale);
  const { book, chapter, setPos } = useReaderStore();
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
  const listRef = useRef<FlatList>(null);

  const bIdx = Math.min(book, bible.length - 1);
  const bk = bible[bIdx];
  const cIdx = Math.min(chapter, bk.chapters.length - 1);
  const verses = bk.chapters[cIdx];

  // deep-navigation: /read?b=&c=&v= jumps to a verse (from search / saved)
  useEffect(() => {
    if (params.b != null && params.c != null) {
      setPos(Number(params.b), Number(params.c));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.b, params.c]);

  const targetV = params.v != null ? Number(params.v) : null;
  useEffect(() => {
    if (targetV == null || Number.isNaN(targetV)) return;
    const id = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: targetV, viewPosition: 0.28, animated: true });
      setFlashV(targetV);
      setTimeout(() => setFlashV(null), 2200);
    }, 320);
    return () => clearTimeout(id);
  }, [targetV, bIdx, cIdx]);

  const go = (b: number, c: number) => {
    setPos(b, c);
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

  const bodySize = Math.round(18 * fontScale);
  const bodyLine = Math.round(30 * fontScale);
  const dropCap = Math.round(bodySize * 1.9);

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
          onPress={() => router.back()}
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
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: rt.ink }} numberOfLines={1}>
            {bk.name} {cIdx + 1}
          </Text>
          <Ionicons name="chevron-down" size={18} color={rt.inkFaint} />
        </Pressable>
        {iconBtn('search', tr('a11y.search'), () => router.push('/search'))}
        {iconBtn('text', tr('a11y.readingSettings'), () => setSettings(true))}
      </View>

      <FlatList
        ref={listRef}
        key={`${bIdx}-${cIdx}`}
        data={verses}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({ offset: index * (averageItemLength || bodyLine * 2), animated: false });
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index, viewPosition: 0.28, animated: true });
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
            <Text style={{ fontFamily: fonts.serif, fontSize: Math.round(30 * fontScale), color: rt.ink, marginTop: 4, textAlign: scriptureRtl ? 'right' : 'left', writingDirection: scriptureRtl ? 'rtl' : 'ltr' }}>
              {bk.name}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const hKey = `${bk.code}|${cIdx}|${index}`;
          const color = marks[hKey];
          const tint = color ? HIGHLIGHT_TINT[color] : 'transparent';
          const flashed = flashV === index;
          const ref = `${bk.name} ${cIdx + 1}:${item[0]}`;
          const open = () =>
            setSelected({ book: bIdx, chapter: cIdx, verse: index, code: bk.code, ref, text: item[1] });
          // long-press is the quick path: highlight (or un-highlight) in place,
          // no menu. A short tap opens the full action sheet.
          const quickHighlight = () => {
            Haptics.selectionAsync().catch(() => {});
            if (color) clearMark(hKey);
            else setMark(hKey, 'gold');
          };

          if (index === 0) {
            const first = item[1].slice(0, 1);
            const rest = item[1].slice(1);
            return (
              <Text
                onPress={open}
                onLongPress={quickHighlight}
                suppressHighlighting
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: bodySize,
                  lineHeight: dropCap,
                  color: rt.ink,
                  marginBottom: spacing.sm,
                  backgroundColor: flashed ? rt.goldSoft : tint,
                  borderRadius: 6,
                  textAlign: scriptureRtl ? 'right' : 'left',
                  writingDirection: scriptureRtl ? 'rtl' : 'ltr',
                }}
              >
                <Text style={{ fontFamily: fonts.serif, fontSize: dropCap, color: rt.gold }}>{first}</Text>
                {rest}
              </Text>
            );
          }

          return (
            <Text
              onPress={open}
              onLongPress={quickHighlight}
              suppressHighlighting
              style={{
                fontFamily: fonts.serifLight,
                fontSize: bodySize,
                lineHeight: bodyLine,
                color: rt.ink,
                marginBottom: spacing.sm,
                backgroundColor: flashed ? rt.goldSoft : tint,
                borderRadius: 6,
                textAlign: scriptureRtl ? 'right' : 'left',
                writingDirection: scriptureRtl ? 'rtl' : 'ltr',
              }}
            >
              <Text style={{ fontFamily: fonts.sansBold, fontSize: Math.round(11 * fontScale), color: rt.gold }}>
                {item[0]}
                {'  '}
              </Text>
              {item[1]}
            </Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setPicker(null)} />
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
                <Pressable onPress={() => setPicker('books')} hitSlop={8} accessibilityRole="button">
                  <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={22} color={rt.inkSoft} />
                </Pressable>
              ) : null}
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: rt.ink }}>
                {typeof picker === 'number' ? bible[picker].name : tr('read.pickBook')}
              </Text>
            </View>

            {picker === 'books' ? (
              <FlatList
                data={bible}
                keyExtractor={(b) => b.code}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => setPicker(index)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
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
