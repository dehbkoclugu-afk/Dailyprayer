import React, { useRef } from 'react';
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
  const cardHeight = dawn ? 340 : 320;
  const cardRef = useRef<View>(null);

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
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: spacing.sm }}
        >
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: dawn ? 20 : 25,
              lineHeight: dawn ? 29 : 37,
              letterSpacing: -0.3,
              color: dawn ? t.ink : '#F2EEE6',
              marginLeft: -2,
            }}
          >
            “{verse.text}”
          </Text>
        </ScrollView>
        {!dawn ? (
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(14,18,32,0)', 'rgba(14,18,32,0.92)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 24 }}
          />
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
              <Ionicons name="shuffle" size={21} color={dawn ? t.inkSoft : '#F2EEE6'} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={share}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.shareVerse')}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="share-outline" size={21} color={dawn ? t.inkSoft : '#F2EEE6'} />
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
