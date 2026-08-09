import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { fonts } from '@/theme/typography';
import { radius, shadow, spacing } from '@/theme/tokens';
import { type AssetId } from '@/assets/registry';
import { ArtSlot } from '@/components/ArtSlot';
import type { DailyVerse } from '@/data/verses';
import { useT } from '@/i18n';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';

/**
 * Verse theme → A5 background. Eight themes have dedicated art; the remaining
 * themes borrow the nearest one in mood so every verse still gets a scene.
 */
const VERSE_ART: Record<DailyVerse['theme'], AssetId> = {
  peace: 'A5-verse-peace',
  strength: 'A5-verse-strength',
  trust: 'A5-verse-trust',
  rest: 'A5-verse-rest',
  hope: 'A5-verse-hope',
  guidance: 'A5-verse-guidance',
  joy: 'A5-verse-joy',
  love: 'A5-verse-love',
  anxiety: 'A5-verse-hope', // sunbeam breaking the storm
  gratitude: 'A5-verse-joy', // golden harvest
  comfort: 'A5-verse-rest', // candlelit calm
  faith: 'A5-verse-guidance', // star to follow
  forgiveness: 'A5-verse-love', // reaching hands
};

const VERSE_TEXT_STYLES = [
  { fontSize: 24, lineHeight: 35 },
  { fontSize: 21, lineHeight: 31 },
  { fontSize: 18, lineHeight: 27 },
  { fontSize: 16, lineHeight: 24 },
] as const;

function initialVerseFontStep(text: string) {
  if (text.length > 180) return 3;
  if (text.length > 125) return 2;
  if (text.length > 80) return 1;
  return 0;
}

interface Props {
  verse: DailyVerse;
  onRead?: () => void;
  /** Swap the shown verse for another from the pool (optional affordance). */
  onShuffle?: () => void;
}

export function VerseCard({ verse, onRead, onShuffle }: Props) {
  const { t: tr } = useT();
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const cardHeight = 340;
  const [fontStep, setFontStep] = useState(() => initialVerseFontStep(verse.text));
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const cardRef = useRef<View>(null);
  const verseType = VERSE_TEXT_STYLES[fontStep];
  const lastFontStep = VERSE_TEXT_STYLES.length - 1;
  const hasOverflow = fontStep === lastFontStep && viewportHeight > 0 && contentHeight > viewportHeight + 2;

  useEffect(() => {
    setFontStep(initialVerseFontStep(verse.text));
    setViewportHeight(0);
    setContentHeight(0);
  }, [verse.reference, verse.text]);

  useEffect(() => {
    if (viewportHeight > 0 && contentHeight > viewportHeight + 2 && fontStep < lastFontStep) {
      setFontStep((step) => Math.min(step + 1, lastFontStep));
    }
  }, [contentHeight, fontStep, lastFontStep, viewportHeight]);

  /** Share the rendered card as an image (organic growth); text fallback on web/failure. */
  const share = async () => {
    const text = `“${verse.text}” , ${verse.reference}\n\nLumen 🕊`;
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
        await Sharing.shareAsync(uri, { dialogTitle: verse.reference });
        return;
      }
    } catch {
      // fall through to text share
    }
    Share.share({ message: text }).catch(() => {});
  };

  const content = (
    <View
      style={{
        flex: 1,
        width: '100%',
        padding: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          color: t.gold,
        }}
      >
        {tr('today.verseOfDay')}
      </Text>

      <View style={{ flex: 1, marginTop: spacing.sm }}>
        <ScrollView
          key={`${verse.reference}:${fontStep}`}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          scrollEnabled
          showsVerticalScrollIndicator={hasOverflow}
          persistentScrollbar={hasOverflow}
          nestedScrollEnabled
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: hasOverflow ? 'flex-start' : 'center',
            paddingBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: verseType.fontSize,
              lineHeight: verseType.lineHeight,
              letterSpacing: -0.3,
              textAlign: hasOverflow ? 'left' : 'center',
              color: dawn ? t.ink : '#F2EEE6',
            }}
          >
            “{verse.text}”
          </Text>
        </ScrollView>
        {hasOverflow ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: dawn ? 'rgba(255,255,255,0.84)' : 'rgba(14,18,32,0.84)',
            }}
          >
            <Ionicons name="chevron-down" size={16} color={dawn ? t.ink : '#F2EEE6'} />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.gold, flexShrink: 1, maxWidth: '62%' }}
        >
          {verse.reference}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onShuffle ? (
            <Pressable
              onPress={onShuffle}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.anotherVerse')}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons name="shuffle" size={21} color={dawn ? t.ink : '#F2EEE6'} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={share}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.shareVerse')}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="share-outline" size={21} color={dawn ? t.ink : '#F2EEE6'} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      ref={cardRef}
      onPress={onRead}
      accessibilityRole="button"
      accessibilityLabel={`Verse of the day, ${verse.reference}`}
      // The hero frame stays stable. Header and source/actions remain fixed while
      // the middle verse region scales down, then scrolls for exceptionally long text.
      style={[
        { height: cardHeight, borderRadius: radius.hero, overflow: 'hidden' },
        shadow.card,
      ]}
    >
      <ArtSlot id={VERSE_ART[verse.theme]} height={cardHeight} radius={radius.hero} variant={dawn ? 'card' : 'hero'}>
        {content}
      </ArtSlot>
    </Pressable>
  );
}
