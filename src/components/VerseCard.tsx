import React, { useRef } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { type as ty, verseCardTypes } from '@/theme/typography';
import { elevation, interaction, radius, spacing } from '@/theme/tokens';
import { type AssetId } from '@/assets/registry';
import { ArtSlot } from '@/components/ArtSlot';
import type { DailyVerse } from '@/data/verses';
import { useT } from '@/i18n';
import { localeUpperCase } from '@/i18n/localeText';
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
  const t = useTheme();
  const { t: tr, locale } = useT();
  const cardRef = useRef<View>(null);
  const verseType = verseCardTypes[initialVerseFontStep(verse.text)];

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
        width: '100%',
        minHeight: 340,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          ...ty.overline,
          color: t.onArtwork,
        }}
      >
        {localeUpperCase(tr('today.verseOfDay'), locale)}
      </Text>

      <View style={{ flexGrow: 1, justifyContent: 'center', marginTop: spacing.lg, marginBottom: spacing.md }}>
          <Text
            style={{
              ...verseType,
              letterSpacing: -0.3,
              textAlign: 'center',
              color: t.onArtwork,
              textShadowColor: 'rgba(0,0,0,0.72)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 8,
            }}
          >
            “{verse.text}”
          </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
          marginTop: spacing.sm,
        }}
      >
        <Text
          style={[ty.secondaryMedium, { color: t.onArtworkMuted, flexGrow: 1, flexBasis: 150 }]}
        >
          {verse.reference}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
          {onShuffle ? (
            <Pressable
              onPress={onShuffle}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.anotherVerse')}
              style={({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? interaction.pressedOpacity : 1 })}
            >
              <Ionicons name="shuffle" size={21} color={t.onArtwork} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={share}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.shareVerse')}
            style={({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? interaction.pressedOpacity : 1 })}
          >
            <Ionicons name="share-outline" size={21} color={t.onArtwork} />
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
      accessibilityLabel={`${tr('today.verseOfDay')}, ${verse.reference}`}
      style={[
        { minHeight: 340, borderRadius: radius.hero, overflow: 'hidden' },
        elevation.hero,
      ]}
    >
      <ArtSlot
        id={VERSE_ART[verse.theme]}
        radius={radius.hero}
        scrim="strong"
        style={{ minHeight: 340 }}
      >
        {content}
      </ArtSlot>
    </Pressable>
  );
}
