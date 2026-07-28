import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, Modal, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, reader, type } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { HIGHLIGHT_LABEL, HIGHLIGHT_TINT, QUICK_HIGHLIGHT } from '@/theme/highlights';
import { useReaderTheme } from '@/theme/reading';
import { getBible } from '@/data/bibleFull';
import { useReaderStore } from '@/state/useReaderStore';
import { useReaderPrefsStore } from '@/state/useReaderPrefsStore';
import { useHighlightStore } from '@/state/useHighlightStore';
import { ReadingSettingsSheet } from '@/components/ReadingSettingsSheet';
import { VerseActionSheet, type SelectedVerse } from '@/components/VerseActionSheet';
import { useT } from '@/i18n';
import { useSheetTitleFocus, useTriggerFocus } from '@/a11y/sheetFocus';
import { NotFoundState } from '@/components/NotFoundState';
import { useReduceMotion } from '@/a11y/reduceMotion';

export default function Read() {
  const { t: tr, locale, tu } = useT();
  const reduceMotion = useReduceMotion();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const bible = getBible(locale);
  const { book, chapter, setPos, setVerse } = useReaderStore();
  const fontScale = useReaderPrefsStore((s) => s.fontScale);
  const readerHintSeen = useReaderPrefsStore((s) => s.readerHintSeen);
  const dismissReaderHint = useReaderPrefsStore((s) => s.dismissReaderHint);
  const marks = useHighlightStore((s) => s.marks);
  const setMark = useHighlightStore((s) => s.set);
  const clearMark = useHighlightStore((s) => s.clear);
  const params = useLocalSearchParams<{ b?: string; c?: string; v?: string }>();

  // reading palette: paper override folded over the app theme
  const rt = useReaderTheme();

  const [picker, setPicker] = useState<null | 'books' | number>(null);
  const [settings, setSettings] = useState(false);
  const [tools, setTools] = useState(false);
  const [bookQuery, setBookQuery] = useState('');
  const [selected, setSelected] = useState<SelectedVerse | null>(null);
  const [flashV, setFlashV] = useState<number | null>(null);
  const listRef = useRef<FlatList>(null);
  const chapterRef = useRef<FlatList>(null);

  // Focus follows the sheets: into the title on open, back to the control that
  // opened them on close (roadmap item 28). The picker's second argument re-runs
  // it when the book list becomes the chapter grid — same sheet, new title.
  const pickerTitleRef = useSheetTitleFocus(picker !== null, picker === 'books');
  const pickerTriggerRef = useTriggerFocus(picker !== null);
  const settingsTriggerRef = useTriggerFocus(settings);

  // `book`/`chapter` come from the persisted position, which a bad deep link could
  // previously poison with NaN — Math.min(NaN, 65) is NaN, and bible[NaN].chapters
  // threw. Clamp through a finite integer so the reader always has somewhere to be.
  const safeIndex = (value: number, max: number) =>
    Number.isInteger(value) ? Math.min(Math.max(value, 0), max) : 0;
  const bIdx = safeIndex(book, bible.length - 1);
  const bk = bible[bIdx];
  const cIdx = bk ? safeIndex(chapter, bk.chapters.length - 1) : 0;
  const verses = bk?.chapters[cIdx];
  const bookRows = useMemo(() => {
    const query = bookQuery.trim().toLocaleLowerCase(locale);
    const matching = bible
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !query || item.name.toLocaleLowerCase(locale).includes(query));
    return [
      { header: tr('read.oldTestament') },
      ...matching.filter(({ index }) => index < 39),
      { header: tr('read.newTestament') },
      ...matching.filter(({ index }) => index >= 39),
    ];
  }, [bible, bookQuery, locale, tr]);

  // deep-navigation: /read?b=&c=&v= jumps to a verse (from search / saved)
  useEffect(() => {
    if (params.b == null || params.c == null) return;
    // Only accept a reference this edition actually has. An out-of-range or
    // non-numeric link must not overwrite where the reader was sitting.
    const b = Number(params.b);
    const c = Number(params.c);
    if (!Number.isInteger(b) || !Number.isInteger(c)) return;
    if (b < 0 || b >= bible.length) return;
    if (c < 0 || c >= bible[b].chapters.length) return;
    const v = params.v == null ? 0 : Number(params.v);
    setPos(b, c, Number.isInteger(v) && v >= 0 && v < bible[b].chapters[c].length ? v : 0);
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

  useEffect(() => {
    if (picker !== bIdx) return;
    const id = setTimeout(() => chapterRef.current?.scrollToIndex({ index: cIdx, viewPosition: 0.45, animated: false }), 120);
    return () => clearTimeout(id);
  }, [picker, bIdx, cIdx]);

  const go = (b: number, c: number) => {
    setPos(b, c);
    setPicker(null);
  };
  // Where the chapter arrows lead, worked out once. The boundary rule used to be
  // written three times — in prev(), in next() and again as hasPrev/hasNext — and
  // the accessible label needs the same answer, so it is one calculation now.
  const nextPos: [number, number] | null =
    cIdx + 1 < bk.chapters.length
      ? [bIdx, cIdx + 1]
      : bIdx + 1 < bible.length
        ? [bIdx + 1, 0]
        : null;
  const prevPos: [number, number] | null =
    cIdx > 0
      ? [bIdx, cIdx - 1]
      : bIdx > 0
        ? [bIdx - 1, bible[bIdx - 1].chapters.length - 1]
        : null;
  const next = () => nextPos && go(...nextPos);
  const prev = () => prevPos && go(...prevPos);
  const refOf = ([b, c]: [number, number]) => `${bible[b].name} ${c + 1}`;

  const bodySize = Math.round(reader.body * fontScale);
  const bodyLine = Math.round(reader.line * fontScale);
  const dropCap = Math.round(bodySize * reader.dropCapRatio);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const first = viewableItems.find((item) => item.index != null)?.index;
      if (first != null) setVerse(first);
    },
  ).current;

  const iconBtn = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
    ref?: React.Ref<View>,
  ) => (
    <Pressable
      ref={ref}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: TAP_MIN,
        height: TAP_MIN,
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

  // `disabled` is enough for the *state*: RN's Pressable folds the prop into
  // accessibilityState, so TalkBack already says "dimmed". What it cannot supply
  // is the reason — "Previous, button, dimmed" leaves the reader guessing — so a
  // disabled arrow says it has run out of Bible, and an enabled one says where it
  // goes rather than just "Previous".
  const navBtn = (
    dir: 'prev' | 'next',
    target: [number, number] | null,
    onPress: () => void,
    label: string,
  ) => (
    <Pressable
      onPress={target ? onPress : undefined}
      disabled={!target}
      accessibilityRole="button"
      accessibilityLabel={
        target
          ? `${tr(dir === 'prev' ? 'a11y.prevChapter' : 'a11y.nextChapter')}, ${refOf(target)}`
          : tr(dir === 'prev' ? 'a11y.atBibleStart' : 'a11y.atBibleEnd')
      }
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
        // Padding alone rendered these at 43dp tall; the minimum has to be explicit.
        minHeight: TAP_MIN,
        paddingVertical: 12,
        opacity: target ? 1 : 0.4,
      }}
    >
      {dir === 'prev' ? <Ionicons name="chevron-back" size={16} color={rt.inkSoft} /> : null}
      <Text style={{ ...type.calloutMedium, color: rt.inkSoft }}>{label}</Text>
      {dir === 'next' ? <Ionicons name="chevron-forward" size={16} color={rt.inkSoft} /> : null}
    </Pressable>
  );

  // Placed after every hook: a missing book or chapter means the bundled edition
  // could not answer, which is a designed dead end rather than a blank screen.
  if (!bk || !verses) {
    return (
      <NotFoundState
        icon="book-outline"
        title={tr('notFound.passageTitle')}
        body={tr('notFound.passageBody')}
        actionLabel={tr('notFound.passageAction')}
        onAction={() => router.replace('/(tabs)/bible')}
      />
    );
  }

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
            width: TAP_MIN,
            height: TAP_MIN,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: rt.surface,
            borderWidth: 1,
            borderColor: rt.border,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={rt.inkSoft} />
        </Pressable>
        <Pressable
          ref={pickerTriggerRef}
          onPress={() => setPicker('books')}
          accessibilityRole="button"
          // Without a label this reads as just "Psalms 23, button" — the passage
          // but not the fact that tapping it changes the passage.
          accessibilityLabel={`${bk.name} ${cIdx + 1}, ${tr('a11y.pickPassage')}`}
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
            height: TAP_MIN,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ ...type.bodySemi, color: rt.ink }} numberOfLines={1}>
            {bk.name} {cIdx + 1}
          </Text>
          <Ionicons name="chevron-down" size={18} color={rt.inkFaint} />
        </Pressable>
        {compact
          ? iconBtn('ellipsis-horizontal', tr('read.tools'), () => setTools(true), settingsTriggerRef)
          : <>
              {iconBtn('search', tr('a11y.search'), () => router.push('/search'))}
              {iconBtn('text', tr('a11y.readingSettings'), () => setSettings(true), settingsTriggerRef)}
            </>}
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
              style={{ ...type.overline, letterSpacing: 2.5,
                color: rt.gold }}
            >
              {tu(`${tr('read.chapter')} ${cIdx + 1}`)}
            </Text>
            <Text style={{ fontFamily: fonts.serif, fontSize: Math.round(reader.chapterTitle * fontScale), color: rt.ink, marginTop: 4 }}>
              {bk.name}
            </Text>
            {!readerHintSeen ? (
              <View
                style={{
                  marginTop: spacing.md,
                  padding: spacing.md,
                  borderRadius: radius.inner,
                  backgroundColor: rt.surfaceAlt,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <Text style={{ ...type.labelMedium, color: rt.inkSoft, flex: 1 }}>
                  {tr('read.readerHint')}
                </Text>
                <Pressable
                  onPress={dismissReaderHint}
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.close')}
                  style={{ width: TAP_MIN, height: TAP_MIN, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={18} color={rt.inkSoft} />
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
          const open = () =>
            setSelected({ book: bIdx, chapter: cIdx, verse: index, code: bk.code, ref, text: item[1] });
          // long-press is the quick path: highlight (or un-highlight) in place,
          // no menu. A short tap opens the full action sheet.
          const quickHighlight = () => {
            Haptics.selectionAsync().catch(() => {});
            if (color) clearMark(hKey);
            else setMark(hKey, QUICK_HIGHLIGHT);
            // Haptics are the only confirmation a sighted user needs; a screen
            // reader gets nothing, and the tint it cannot see is the whole result.
            // The shortcut offers no colour choice, so it says which one it used.
            AccessibilityInfo.announceForAccessibility(
              color
                ? tr('verse.highlightRemoved')
                : `${tr('verse.highlightAdded')}, ${tr(HIGHLIGHT_LABEL[QUICK_HIGHLIGHT])}`,
            );
          };

          // Roadmap item 25. Tapping opens a sheet and long-pressing highlights,
          // neither of which a screen reader can discover — TalkBack announces a
          // verse as plain text and nothing suggests it does anything.
          //
          // These stay Text rather than becoming buttons on purpose: Scripture is
          // read by swiping verse to verse, and hearing "button" after every verse
          // of every chapter is noise. `accessibilityActions` puts the two actions
          // in TalkBack's actions menu instead, which is where an occasional action
          // on a text element belongs.
          const verseA11y = {
            accessible: true,
            // The visible number is a nested Text, so it is read as a bare numeral
            // running into the first word; naming it separates the two. The
            // highlight goes *before* the verse, not after — a long verse takes
            // twenty seconds to read out, and the state is what the reader is
            // listening for.
            accessibilityLabel: color
              ? `${tr('read.verse')} ${item[0]}, ${tr('a11y.highlighted')}, ${tr(HIGHLIGHT_LABEL[color])}. ${item[1]}`
              : `${tr('read.verse')} ${item[0]}. ${item[1]}`,
            accessibilityActions: [
              { name: 'activate', label: tr('a11y.verseActions') },
              {
                name: 'highlight',
                label: tr(color ? 'verse.removeHighlight' : 'verse.highlight'),
              },
            ],
            onAccessibilityAction: ({
              nativeEvent: { actionName },
            }: {
              nativeEvent: { actionName: string };
            }) => {
              if (actionName === 'highlight') quickHighlight();
              // Declaring `activate` takes over the standard click action on
              // Android, so onPress no longer runs for a screen reader.
              else open();
            },
          };

          if (index === 0) {
            const first = item[1].slice(0, 1);
            const rest = item[1].slice(1);
            return (
              <Text
                onPress={open}
                onLongPress={quickHighlight}
                suppressHighlighting
                {...verseA11y}
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: bodySize,
                  lineHeight: dropCap,
                  color: rt.ink,
                  marginBottom: spacing.sm,
                  backgroundColor: flashed ? rt.goldSoft : tint,
                  borderRadius: 6,
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
              {...verseA11y}
              style={{
                fontFamily: fonts.serifLight,
                fontSize: bodySize,
                lineHeight: bodyLine,
                color: rt.ink,
                marginBottom: spacing.sm,
                backgroundColor: flashed ? rt.goldSoft : tint,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontFamily: fonts.sansBold, fontSize: Math.round(reader.verseNumber * fontScale), color: rt.gold }}>
                {item[0]}
                {'  '}
              </Text>
              {item[1]}
            </Text>
          );
        }}
        ListFooterComponent={
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            {navBtn('prev', prevPos, prev, tr('read.prev'))}
            {navBtn('next', nextPos, next, tr('read.next'))}
          </View>
        }
      />

      {/* book / chapter picker */}
      <Modal
        visible={picker !== null}
        transparent
        animationType={reduceMotion ? 'none' : 'slide'}
        onRequestClose={() => setPicker(null)}
        statusBarTranslucent
      >
        {/* accessibilityViewIsModal is the iOS half of containment — VoiceOver
            would otherwise walk past the sheet into the reader. On Android the
            Modal is its own window, so TalkBack cannot reach behind it. */}
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
          {/* The dim area dismisses on tap, but it is not a control a screen
              reader should land on: it has nothing to announce, and the gesture
              back / onRequestClose already closes the sheet. */}
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setPicker(null)}
            importantForAccessibility="no"
            accessibilityElementsHidden
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
                  accessibilityRole="button"
                  // Not a generic "go back" — it returns to the book list, one
                  // level inside the sheet, and saying so avoids the guess that
                  // it closes the sheet.
                  accessibilityLabel={tr('a11y.backToBooks')}
                  style={{
                    width: TAP_MIN,
                    height: TAP_MIN,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="chevron-back" size={22} color={rt.inkSoft} />
                </Pressable>
              ) : null}
              <Text
                ref={pickerTitleRef}
                accessibilityRole="header"
                style={{ ...type.bodySemi, color: rt.ink }}
              >
                {typeof picker === 'number' ? bible[picker].name : tr('read.pickBook')}
              </Text>
            </View>

            {picker === 'books' ? (
              <>
              <TextInput
                value={bookQuery}
                onChangeText={setBookQuery}
                placeholder={tr('read.pickBookSearch')}
                placeholderTextColor={rt.inkFaint}
                accessibilityLabel={tr('read.pickBookSearch')}
                style={{
                  ...type.body,
                  color: rt.ink,
                  minHeight: TAP_MIN,
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.pill,
                  backgroundColor: rt.surfaceAlt,
                }}
              />
              <FlatList
                data={bookRows}
                keyExtractor={(row, index) => 'header' in row ? `h-${row.header}` : row.item.code}
                contentContainerStyle={{ paddingHorizontal: spacing.lg }}
                renderItem={({ item: row, index: rowIndex }) => 'header' in row ? (
                  <Text accessibilityRole="header" style={{ ...type.labelSemi, color: rt.goldText, marginTop: spacing.md }}>
                    {row.header}
                  </Text>
                ) : (
                  <Pressable
                    onPress={() => setPicker(row.index)}
                    accessibilityRole="button"
                    accessibilityLabel={row.item.name}
                    // The row does not open the book, it opens its chapters —
                    // and the current book is marked only by weight and colour,
                    // which a screen reader cannot see.
                    accessibilityHint={tr('a11y.opensChapters')}
                    accessibilityState={{ selected: row.index === bIdx }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      // Padding alone gives 47dp on the first row, which is the
                      // only one without a divider adding its pixel back.
                      minHeight: TAP_MIN,
                      paddingVertical: 14,
                      borderTopWidth: rowIndex === 0 ? 0 : 1,
                      borderTopColor: rt.border,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <Text
                      style={{
                        ...type.body,
                        fontFamily: row.index === bIdx ? fonts.sansSemiBold : fonts.sans,
                        color: row.index === bIdx ? rt.gold : rt.ink,
                      }}
                    >
                      {row.item.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={rt.inkFaint} />
                  </Pressable>
                )}
              />
              </>
            ) : typeof picker === 'number' ? (
              <FlatList
                ref={chapterRef}
                key="chapters"
                data={bible[picker].chapters}
                keyExtractor={(_, i) => String(i)}
                numColumns={5}
                onScrollToIndexFailed={({ index }) =>
                  chapterRef.current?.scrollToOffset({ offset: Math.floor(index / 5) * 72, animated: false })
                }
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                columnWrapperStyle={{ gap: spacing.sm }}
                renderItem={({ index }) => {
                  const active = picker === bIdx && index === cIdx;
                  return (
                    <Pressable
                      onPress={() => go(picker as number, index)}
                      accessibilityRole="button"
                      // A bare "3" says nothing on its own; the book name is on
                      // screen but not in the cell.
                      accessibilityLabel={`${bible[picker].name} ${index + 1}`}
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
                        style={{ ...type.calloutMedium, color: active ? rt.gold : rt.ink,
                          fontVariant: ['tabular-nums'] }}
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
      <Modal
        visible={tools}
        transparent
        animationType={reduceMotion ? 'none' : 'slide'}
        onRequestClose={() => setTools(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
          <Pressable style={{ flex: 1 }} onPress={() => setTools(false)} importantForAccessibility="no" accessibilityElementsHidden />
          <View style={{ backgroundColor: rt.surface, padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}>
            <Text accessibilityRole="header" style={{ ...type.bodySemi, color: rt.ink }}>{tr('read.tools')}</Text>
            {[
              { icon: 'search' as const, label: tr('a11y.search'), action: () => router.push('/search') },
              { icon: 'text' as const, label: tr('a11y.readingSettings'), action: () => setSettings(true) },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  setTools(false);
                  item.action();
                }}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  minHeight: TAP_MIN,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name={item.icon} size={20} color={rt.inkSoft} />
                <Text style={{ ...type.body, color: rt.ink }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
