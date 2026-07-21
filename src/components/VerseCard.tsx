import React, { useRef } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { fonts } from '@/theme/typography';
import { radius, shadow, spacing } from '@/theme/tokens';
import { ArtSlot } from '@/components/ArtSlot';
import type { AssetId } from '@/assets/registry';
import type { DailyVerse } from '@/data/verses';
import { useT } from '@/i18n';

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
}

export function VerseCard({ verse, onRead }: Props) {
  const { t: tr } = useT();
  const cardRef = useRef<View>(null);

  /** Share the rendered card as an image (organic growth); text fallback on web/failure. */
  const share = async () => {
    const text = `“${verse.text}” — ${verse.reference}\n\nLumen 🕊`;
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

  return (
    <Pressable
      ref={cardRef}
      onPress={onRead}
      accessibilityRole="button"
      accessibilityLabel={`Verse of the day, ${verse.reference}`}
      style={[{ borderRadius: radius.hero, overflow: 'hidden' }, shadow.card]}
    >
      {/* Painterly art layer (A5 series, chosen by verse theme) + scrim for legibility */}
      <ArtSlot id={VERSE_ART[verse.theme]} height={340} radius={radius.hero}>
        <LinearGradient
          colors={['rgba(23,16,46,0.55)', 'rgba(14,18,32,0.92)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing.xxl, justifyContent: 'flex-end' }}>
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: 'rgba(217,164,65,0.85)',
            }}
          >
{tr('today.verseOfDay')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 27,
              lineHeight: 39,
              letterSpacing: -0.3,
              color: '#F2EEE6',
              marginTop: spacing.md,
              // hanging opening quote
              marginLeft: -2,
            }}
          >
            “{verse.text}”
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.lg,
            }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: '#D9A441' }}>
              {verse.reference}
            </Text>
            <Pressable
              onPress={share}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.shareVerse')}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="share-outline" size={22} color="#F2EEE6" />
            </Pressable>
          </View>
        </View>
      </ArtSlot>
    </Pressable>
  );
}
