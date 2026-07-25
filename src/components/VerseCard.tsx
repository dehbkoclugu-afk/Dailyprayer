import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Share, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { fonts } from '@/theme/typography';
import { radius, shadow, spacing } from '@/theme/tokens';
import { ArtSlot } from '@/components/ArtSlot';
import { verseArt } from '@/assets/registry';
import type { DailyVerse } from '@/data/verses';
import { useT } from '@/i18n';

interface Props {
  verse: DailyVerse;
  onRead?: () => void;
}

export function VerseCard({ verse, onRead }: Props) {
  const { t: tr } = useT();
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const cardHeight = Math.min(520, 320 + Math.ceil(verse.text.length / 110) * 48);

  /** Share the rendered card as an image (organic growth); text fallback on web/failure. */
  const share = async () => {
    if (sharing) return;
    setSharing(true);
    const text = `“${verse.text}” — ${verse.reference}\n\nLumen`;
    try {
      if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(cardRef, {
          format: 'jpg',
          quality: 0.9,
          width: 1080,
          height: Math.round((1080 / 340) * cardHeight),
        });
        await Sharing.shareAsync(uri, { dialogTitle: verse.reference });
        return;
      }
    } catch {
      // fall through to text share
    } finally {
      setSharing(false);
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
      <ArtSlot id={verseArt(verse.theme)} height={cardHeight} radius={radius.hero}>
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
              marginLeft: -2,
              marginTop: spacing.md,
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
              onPress={(event) => {
                event.stopPropagation();
                share();
              }}
              disabled={sharing}
              accessibilityRole="button"
              accessibilityState={{ busy: sharing, disabled: sharing }}
              accessibilityLabel={tr('verse.share')}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              {sharing ? (
                <ActivityIndicator color="#F2EEE6" />
              ) : (
                <Ionicons name="share-outline" size={22} color="#F2EEE6" />
              )}
            </Pressable>
          </View>
        </View>
      </ArtSlot>
    </Pressable>
  );
}
