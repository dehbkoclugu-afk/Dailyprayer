import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  { fontSize: 26, lineHeight: 38 },
  { fontSize: 23, lineHeight: 34 },
  { fontSize: 20, lineHeight: 30 },
  { fontSize: 18, lineHeight: 27 },
] as const;

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
  const initialFontStep = verse.text.length > 220 ? 2 : verse.text.length > 140 ? 1 : 0;
  const [fontStep, setFontStep] = useState(initialFontStep);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const cardRef = useRef<View>(null);
  const verseType = VERSE_TEXT_STYLES[fontStep];
  const lastFontStep = VERSE_TEXT_STYLES.length - 1;
  const hasOverflow = fontStep === lastFontStep && viewportHeight > 0 && contentHeight > viewportHeight + 2;

  useEffect(() => {
    setFontStep(verse.text.length > 220 ? 2 : verse.text.length > 140 ? 1 : 0);
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
        width: dawn ? '82%' : '100%',
        padding: dawn ? spacing.lg : spacing.xl,
        paddingTop: dawn ? spacing.xl : spacing.xxl,
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
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          scrollEnabled={hasOverflow}
          showsVerticalScrollIndicator={hasOverflow}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: spacing.sm }}
        >
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: verseType.fontSize,
              lineHeight: verseType.lineHeight,
              letterSpacing: -0.3,
              color: dawn ? t.ink : '#F2EEE6',
              marginLeft: -2,
            }}
          >
            “{verse.text}”
          </Text>
        </ScrollView>
        {hasOverflow ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 30, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <LinearGradient
              colors={dawn ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.86)'] : ['rgba(14,18,32,0)', 'rgba(14,18,32,0.92)']}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            />
            <Ionicons name="chevron-down" size={16} color={dawn ? t.ink : '#F2EEE6'} />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.gold }}>
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
      // A fixed-height hero box: the frame stays constant so the layout below it
      // never shifts. Long verses scroll gently inside instead of growing the card.
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
