import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  Text,
  useWindowDimensions,
  View,
  findNodeHandle,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type ViewToken,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, scaledType, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { HIGHLIGHT_TINT } from '@/theme/highlights';
import { useReaderTheme } from '@/theme/reading';
import { getBible, getBibleSource } from '@/data/bibleFull';
import { useReaderStore } from '@/state/useReaderStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { ReadingSettingsSheet } from '@/components/ReadingSettingsSheet';
import { VerseActionSheet, type SelectedVerse } from '@/components/VerseActionSheet';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { RTL_LOCALE_TAGS } from '@/i18n/globalLanguageCatalog';
import { InvalidRouteState } from '@/components/InvalidRouteState';
import { integerParam, validReaderPosition } from '@/lib/routeValidation';
import { getReaderAccessibilityCopy } from '@/i18n/readerAccessibility';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import { accessibleVerseLabel } from '@/lib/accessibility';
import { isExpandedLayout } from '@/lib/adaptiveLayout';
import { newTestamentStart } from '@/lib/scriptureNavigation';
import { testamentLabels } from '@/i18n/testamentLabels';
import { ScriptureAudioBible } from '@/components/ScriptureAudioBible';

export default function Read() {
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const scriptureRtl = RTL_LOCALE_TAGS.includes(scriptureLocale);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const expanded = isExpandedLayout(width);
  const bible = getBible(scriptureLocale);
  const scriptureSource = getBibleSource(scriptureLocale);
  const { book, chapter, setPos } = useReaderStore();
  const initialSavedVerse = useRef(useReaderStore.getState().verse).current;
  const initialPosition = useRef({ book, chapter }).current;
  const fontScale = useReaderPrefsStore((s) => s.fontScale);
  const showGestureHint = useReaderPrefsStore((s) => s.showGestureHint);
  const dismissGestureHint = useReaderPrefsStore((s) => s.dismissGestureHint);
  const marks = useHighlightStore((s) => s.marks);
  const setMark = useHighlightStore((s) => s.set);
  const clearMark = useHighlightStore((s) => s.clear);
  const params = useLocalSearchParams<{ b?: string | string[]; c?: string | string[]; v?: string | string[]; eb?: string | string[]; ec?: string | string[]; settings?: string }>();
  const hasDeepPosition = params.b != null || params.c != null;
  const deepPosition = hasDeepPosition
    ? validReaderPosition(params.b, params.c, bible.map((entry) => entry.chapters.length))
    : null;
  const invalidDeepPosition = hasDeepPosition && deepPosition == null;

  // reading palette: paper override folded over the app theme
  const rt = useReaderTheme();

  const [picker, setPicker] = useState<null | 'books' | number>(null);
  const [settings, setSettings] = useState(params.settings === '1');
  const [selected, setSelected] = useState<SelectedVerse | null>(null);
  const [flashV, setFlashV] = useState<number | null>(null);
  const [bookQuery, setBookQuery] = useState('');
  const [toolbar, setToolbar] = useState(false);
  const listRef = useRef<FlatList>(null);
  const pickerHeadingRef = useRef<Text>(null);
  const pickerReturnFocus = useRef<number | null>(null);
  const settingsReturnFocus = useRef<number | null>(null);
  const verseReturnFocus = useRef<number | null>(null);

  useModalAccessibility(picker !== null, pickerHeadingRef, pickerReturnFocus.current);

  const safeBook = Number.isInteger(book) ? book : 0;
  const bIdx = deepPosition?.book ?? Math.max(0, Math.min(safeBook, bible.length - 1));
  const bk = bible[bIdx];
  const safeChapter = Number.isInteger(chapter) ? chapter : 0;
  const cIdx = deepPosition?.chapter ?? Math.max(0, Math.min(safeChapter, bk.chapters.length - 1));
  const verses = bk.chapters[cIdx];
  const testamentStart = newTestamentStart(bible.map((bookItem) => bookItem.code));
  const [oldTestament, newTestament] = testamentLabels(locale);
  const visibleBooks = bible
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.name.toLocaleLowerCase(scriptureLocale).includes(bookQuery.trim().toLocaleLowerCase(scriptureLocale)));

  // deep-navigation: /read?b=&c=&v= jumps to a verse (from search / saved)
  useEffect(() => {
    if (deepPosition) setPos(deepPosition.book, deepPosition.chapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepPosition?.book, deepPosition?.chapter]);

  const deepVerse = integerParam(params.v);
  const safeSavedVerse = Number.isInteger(initialSavedVerse) ? initialSavedVerse : 0;
  const targetV = params.v == null
    ? (bIdx === initialPosition.book && cIdx === initialPosition.chapter ? Math.max(0, Math.min(safeSavedVerse, verses.length - 1)) : 0)
    : deepVerse;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((item) => item.isViewable && item.index != null)?.index;
    if (first != null) useReaderStore.getState().setVerse(first);
  }).current;
  useEffect(() => {
    if (targetV == null || targetV >= verses.length) return;
    let flashTimer: ReturnType<typeof setTimeout> | null = null;
    const id = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: targetV, viewPosition: 0.28, animated: true });
      setFlashV(targetV);
      flashTimer = setTimeout(() => setFlashV(null), 2200);
    }, 320);
    return () => {
      clearTimeout(id);
      if (flashTimer) clearTimeout(flashTimer);
    };
  }, [targetV, bIdx, cIdx, verses.length]);

  const hasPassageEnd = params.eb != null || params.ec != null;
  const passageEnd = hasPassageEnd
    ? validReaderPosition(params.eb, params.ec, bible.map((entry) => entry.chapters.length))
    : null;
  if (invalidDeepPosition || (hasPassageEnd && passageEnd == null) || (params.v != null && (deepVerse == null || deepVerse >= verses.length))) {
    return <InvalidRouteState />;
  }

  const go = (b: number, c: number) => {
    setPos(b, c);
    setPicker(null);
  };
  const next = () => {
    if (passageEnd && (bIdx > passageEnd.book || (bIdx === passageEnd.book && cIdx >= passageEnd.chapter))) return;
    if (cIdx + 1 < bk.chapters.length) go(bIdx, cIdx + 1);
    else if (bIdx + 1 < bible.length) go(bIdx + 1, 0);
  };
  const prev = () => {
    if (cIdx > 0) go(bIdx, cIdx - 1);
    else if (bIdx > 0) go(bIdx - 1, bible[bIdx - 1].chapters.length - 1);
  };
  const beforePassageEnd = !passageEnd || bIdx < passageEnd.book || (bIdx === passageEnd.book && cIdx < passageEnd.chapter);
  const hasNext = beforePassageEnd && (cIdx + 1 < bk.chapters.length || bIdx + 1 < bible.length);
  const hasPrev = cIdx > 0 || bIdx > 0;

  const readerType = scaledType('readerVerse', fontScale);
  const bodySize = readerType.fontSize;
  const bodyLine = readerType.lineHeight;
  const dropCap = Math.round(bodySize * 1.9);
  const dropCapType = scaledType('displayHero', dropCap / ty.displayHero.fontSize);
  const readerA11y = getReaderAccessibilityCopy(locale);
  const eventHandle = (event: GestureResponderEvent | AccessibilityActionEvent) =>
    findNodeHandle(event.currentTarget as unknown as React.Component);

  const iconBtn = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: (event: GestureResponderEvent) => void,
  ) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 24,
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
        gap: spacing.sm,
        backgroundColor: rt.surface,
        borderWidth: 1,
        borderColor: rt.border,
        borderRadius: radius.pill,
        paddingVertical: 12,
        opacity: enabled ? 1 : 0.4,
      }}
    >
      {dir === 'prev' ? <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={16} color={rt.inkSoft} /> : null}
      <Text style={{ ...ty.labelMedium, color: rt.inkSoft }}>{label}</Text>
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
            width: 48,
            height: 48,
            borderRadius: 24,
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
          onPress={(event) => {
            pickerReturnFocus.current = eventHandle(event);
            setPicker('books');
          }}
          accessibilityRole="button"
          accessibilityLabel={`${tr('read.pickBook')}: ${bk.name}, ${tr('read.chapter')} ${cIdx + 1}`}
          accessibilityHint={tr('read.pickBook')}
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
            height: 48,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ ...ty.bodyCompactStrong, color: rt.ink }} numberOfLines={1}>
            {bk.name} {cIdx + 1}
          </Text>
          <Ionicons name="chevron-down" size={18} color={rt.inkFaint} />
        </Pressable>
        {expanded ? iconBtn('search', tr('a11y.search'), () => router.push('/search')) : null}
        {expanded ? iconBtn('text', tr('a11y.readingSettings'), (event) => {
          settingsReturnFocus.current = eventHandle(event);
          setSettings(true);
        }) : iconBtn('ellipsis-horizontal', tr('read.settings'), (event) => {
          settingsReturnFocus.current = eventHandle(event);
          setToolbar(true);
        })}
      </View>

      <FlatList
        ref={listRef}
        key={`${bIdx}-${cIdx}`}
        data={verses}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
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
                ...ty.labelSmall,
                letterSpacing: 2.5,
                color: rt.gold,
                textAlign: scriptureRtl ? 'right' : 'left',
                writingDirection: scriptureRtl ? 'rtl' : 'ltr',
              }}
            >
              {tr('read.chapter')} {cIdx + 1}
            </Text>
            <Text style={{ ...scaledType('titleLarge', fontScale), color: rt.ink, marginTop: 4, textAlign: scriptureRtl ? 'right' : 'left', writingDirection: scriptureRtl ? 'rtl' : 'ltr' }}>
              {bk.name}
            </Text>
            <ScriptureAudioBible edition={scriptureSource.edition} book={bIdx} chapter={cIdx} palette={rt} />
            {showGestureHint ? (
              <View accessibilityRole="summary" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.inner, backgroundColor: rt.goldSoft, borderWidth: 1, borderColor: rt.gold }}>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Ionicons name="hand-left-outline" size={18} color={rt.gold} />
                    <Text style={[ty.captionRegular, { flex: 1, color: rt.ink }]}>{readerA11y.openVerseActions}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Ionicons name="finger-print-outline" size={18} color={rt.gold} />
                    <Text style={[ty.captionRegular, { flex: 1, color: rt.ink }]}>{tr('verse.highlight')}</Text>
                  </View>
                </View>
                <Pressable onPress={dismissGestureHint} accessibilityRole="button" accessibilityLabel={tr('a11y.close')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color={rt.inkSoft} />
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const hKey = `${bk.code}|${cIdx}|${index}`;
          const color = marks[hKey];
          const tint = color ? HIGHLIGHT_TINT[color] : 'transparent';
          const flashed = flashV === index;
          const ref = `${bk.name} ${cIdx + 1}:${item[0]}`;
          const open = (returnFocusHandle?: number) => {
            if (returnFocusHandle) verseReturnFocus.current = returnFocusHandle;
            setSelected({ book: bIdx, chapter: cIdx, verse: index, code: bk.code, ref, text: item[1] });
          };
          // long-press is the quick path: highlight (or un-highlight) in place,
          // no menu. A short tap opens the full action sheet.
          const quickHighlight = () => {
            Haptics.selectionAsync().catch(() => {});
            if (color) clearMark(hKey);
            else setMark(hKey, 'gold');
          };
          const accessibilityProps = {
            accessible: true,
            accessibilityRole: 'button' as const,
            accessibilityLabel: accessibleVerseLabel(ref, item[1]),
            accessibilityHint: readerA11y.openVerseActions,
            accessibilityValue: color ? { text: readerA11y.colors[color] } : undefined,
            accessibilityActions: [
              { name: 'open', label: readerA11y.openVerseActions },
              { name: 'highlight', label: tr('verse.highlight') },
            ],
            onAccessibilityAction: (event: AccessibilityActionEvent) => {
              const handle = eventHandle(event) ?? undefined;
              verseReturnFocus.current = handle ?? null;
              if (event.nativeEvent.actionName === 'open') open(handle);
              if (event.nativeEvent.actionName === 'highlight') quickHighlight();
            },
          };

          if (index === 0) {
            const first = item[1].slice(0, 1);
            const rest = item[1].slice(1);
            return (
              <Pressable
                {...accessibilityProps}
                onPress={(event) => open(eventHandle(event) ?? undefined)}
                onLongPress={quickHighlight}
                style={{
                  marginBottom: spacing.sm,
                  backgroundColor: flashed ? rt.goldSoft : tint,
                  borderRadius: 6,
                }}
              >
                <Text
                  accessible={false}
                  importantForAccessibility="no"
                  style={{
                    ...readerType,
                    lineHeight: dropCap,
                    color: rt.ink,
                    textAlign: scriptureRtl ? 'right' : 'left',
                    writingDirection: scriptureRtl ? 'rtl' : 'ltr',
                  }}
                >
                  <Text style={{ ...dropCapType, color: rt.gold }}>{first}</Text>
                  {rest}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              {...accessibilityProps}
              onPress={(event) => open(eventHandle(event) ?? undefined)}
              onLongPress={quickHighlight}
              style={{
                flexDirection: scriptureRtl ? 'row-reverse' : 'row',
                alignItems: 'baseline',
                gap: spacing.sm,
                marginBottom: spacing.sm,
                backgroundColor: flashed ? rt.goldSoft : tint,
                borderRadius: 6,
              }}
            >
              <Text
                accessible={false}
                importantForAccessibility="no"
                style={{ ...scaledType('labelSmallBold', fontScale), color: rt.gold }}
              >
                {item[0]}
              </Text>
              <Text
                accessible={false}
                importantForAccessibility="no"
                style={{
                  flex: 1,
                  ...readerType,
                  color: rt.ink,
                  textAlign: scriptureRtl ? 'right' : 'left',
                  writingDirection: scriptureRtl ? 'rtl' : 'ltr',
                }}
              >
                {item[1]}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            {navBtn('prev', hasPrev, prev, tr('read.prev'))}
            {navBtn('next', hasNext, next, tr('read.next'))}
          </View>
        }
      />

      <Modal visible={toolbar} transparent animationType="fade" onRequestClose={() => setToolbar(false)} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setToolbar(false)} accessible={false} importantForAccessibility="no-hide-descendants" />
          <View accessibilityViewIsModal style={{ backgroundColor: rt.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: spacing.xl, paddingBottom: insets.bottom + spacing.lg, gap: spacing.sm }}>
            <Text accessibilityRole="header" style={[ty.bodyCompactStrong, { color: rt.ink, marginBottom: spacing.sm }]}>{tr('read.settings')}</Text>
            <Pressable onPress={() => { setToolbar(false); router.push('/search'); }} accessibilityRole="button" style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="search" size={22} color={rt.gold} />
              <Text style={[ty.bodyCompact, { color: rt.ink }]}>{tr('read.search')}</Text>
            </Pressable>
            <Pressable onPress={() => { setToolbar(false); setSettings(true); }} accessibilityRole="button" style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: rt.border }}>
              <Ionicons name="text" size={22} color={rt.gold} />
              <Text style={[ty.bodyCompact, { color: rt.ink }]}>{tr('a11y.readingSettings')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* book / chapter picker */}
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setPicker(null)}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <View
            accessibilityViewIsModal
            importantForAccessibility="yes"
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
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.back')}
                  style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={22} color={rt.inkSoft} />
                </Pressable>
              ) : null}
              <Text
                ref={pickerHeadingRef}
                accessible
                accessibilityRole="header"
                style={{ ...ty.bodyCompactStrong, color: rt.ink }}
              >
                {typeof picker === 'number' ? bible[picker].name : tr('read.pickBook')}
              </Text>
            </View>

            {picker === 'books' ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm, height: 48, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: rt.surfaceAlt, borderWidth: 1, borderColor: rt.border }}>
                  <Ionicons name="search" size={18} color={rt.inkFaint} />
                  <TextInput value={bookQuery} onChangeText={setBookQuery} placeholder={tr('read.pickBook')} placeholderTextColor={rt.inkFaint} accessibilityLabel={tr('read.pickBook')} style={{ flex: 1, ...ty.bodyCompact, color: rt.ink }} />
                  {bookQuery ? <Pressable onPress={() => setBookQuery('')} accessibilityRole="button" accessibilityLabel={tr('a11y.close')} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={19} color={rt.inkSoft} /></Pressable> : null}
                </View>
                <FlatList
                data={visibleBooks}
                keyExtractor={({ item }) => item.code}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item: row, index: visibleIndex }) => {
                  const { item, index } = row;
                  const showOld = !bookQuery && index === 0;
                  const showNew = !bookQuery && index === testamentStart;
                  return (
                  <View>
                    {showOld || showNew ? <Text accessibilityRole="header" style={[ty.overline, { color: rt.gold, marginTop: showOld ? spacing.sm : spacing.lg, marginBottom: spacing.sm }]}>{showOld ? oldTestament : newTestament}</Text> : null}
                  <Pressable
                    onPress={() => setPicker(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, ${item.chapters.length} ${tr('read.chapter')}`}
                    accessibilityState={{ selected: index === bIdx }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: 48,
                      paddingVertical: 12,
                      borderTopWidth: visibleIndex === 0 || showOld || showNew ? 0 : 1,
                      borderTopColor: rt.border,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        ...ty.bodyCompact,
                        fontFamily: index === bIdx ? fonts.sansSemiBold : fonts.sans,
                        color: index === bIdx ? rt.gold : rt.ink,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={16} color={rt.inkFaint} />
                  </Pressable>
                  </View>
                );}}
              />
              </>
            ) : typeof picker === 'number' ? (
              <FlatList
                key="chapters"
                data={bible[picker].chapters}
                keyExtractor={(_, i) => String(i)}
                numColumns={5}
                initialScrollIndex={picker === bIdx ? Math.max(0, cIdx - (cIdx % 5)) : 0}
                getItemLayout={(_, index) => ({ length: 72, offset: Math.floor(index / 5) * 72, index })}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                columnWrapperStyle={{ gap: spacing.sm }}
                renderItem={({ index }) => {
                  const active = picker === bIdx && index === cIdx;
                  return (
                    <Pressable
                      onPress={() => go(picker as number, index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${bible[picker].name}, ${tr('read.chapter')} ${index + 1}`}
                      accessibilityState={{ selected: active }}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        minWidth: 48,
                        minHeight: 48,
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
                          ...ty.secondaryMedium,
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

      <ReadingSettingsSheet
        visible={settings}
        onClose={() => setSettings(false)}
        returnFocusHandle={settingsReturnFocus.current}
        sampleReference={`${bk.name} ${cIdx + 1}:${verses[0]?.[0] ?? 1}`}
        sampleText={verses[0]?.[1] ?? ''}
      />
      <VerseActionSheet
        verse={selected}
        onClose={() => setSelected(null)}
        returnFocusHandle={verseReturnFocus.current}
      />
    </View>
  );
}
