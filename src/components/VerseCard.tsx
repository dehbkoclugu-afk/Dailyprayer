import React from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, shadow, spacing } from '@/theme/tokens';
import type { DailyVerse } from '@/data/verses';

interface Props {
  verse: DailyVerse;
  onRead?: () => void;
}

export function VerseCard({ verse, onRead }: Props) {
  const t = useTheme();
  const share = () =>
    Share.share({
      message: `“${verse.text}” — ${verse.reference}\n\nShared from Lumen 🕊`,
    }).catch(() => {});

  return (
    <Pressable onPress={onRead} accessibilityRole="button" accessibilityLabel={`Verse of the day, ${verse.reference}`}>
      <LinearGradient
        colors={[t.duskFrom, t.duskTo]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[{ borderRadius: radius.card, padding: spacing.xl, paddingVertical: spacing.xxl }, shadow.card]}
      >
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#D9A441',
            marginBottom: spacing.lg,
          }}
        >
          Verse of the day
        </Text>
        <Text style={[ty.verse, { color: '#F2EEE6' }]}>“{verse.text}”</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.xl,
          }}
        >
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: '#D9A441' }}>
            {verse.reference}
          </Text>
          <Pressable
            onPress={share}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Share this verse"
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="share-outline" size={22} color="#F2EEE6" />
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
