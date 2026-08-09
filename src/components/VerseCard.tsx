import React, { useRef } from 'react';
import { Image, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { fonts, type as ty } from '@/theme/typography';
import { radius, shadow, spacing, TAP_MIN } from '@/theme/tokens';
import { artRegistry, type AssetId } from '@/assets/registry';
import type { DailyVerse } from '@/data/verses';
import { useT } from '@/i18n';
import { getBibleCredit } from '@/data/bibleFull';

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
  const { t: tr, up, locale } = useT();
  const cardRef = useRef<View>(null);

  // The credit travels with the verse in every direction it can leave the app —
  // rendered onto the shared card and in the text fallback. YTC (CC BY-ND 4.0)
  // and Bíblia Livre (CC BY 4.0) both require the copyright and source
  // information to accompany an extract.
  const credit = getBibleCredit(locale);

  /** Share the rendered card as an image (organic growth); text fallback on web/failure. */
  const share = async () => {
    const text = `“${verse.text}” — ${verse.reference}\n${credit}\n\nLumen 🕊`;
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

  const artSource = artRegistry[VERSE_ART[verse.theme]];

  return (
    <Pressable
      ref={cardRef}
      onPress={onRead}
      accessibilityRole="button"
      // roadmap item 34: was a hardcoded English label; `today.verseOfDay`
      // already exists (used for the card's own overline text) and reads just
      // as naturally as an accessibility label prefix.
      accessibilityLabel={`${tr('today.verseOfDay')}, ${verse.reference}`}
      // minHeight, not height (roadmap item 30): the verse itself already scrolls
      // inside its own ScrollView, but the label above it and the reference/credit/
      // icon row below it do not — at a large system font size those two rows alone
      // can approach 320dp, and a fixed height + overflow:hidden would clip them
      // instead of the card growing to fit.
      style={[
        { minHeight: 320, borderRadius: radius.hero, overflow: 'hidden' },
        shadow.card,
      ]}
    >
      {/* Painterly art layer (A5 series, chosen by verse theme) fills the card */}
      {artSource ? (
        <Image
          source={artSource}
          resizeMode="cover"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <LinearGradient
        colors={['rgba(23,16,46,0.55)', 'rgba(14,18,32,0.92)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <View style={{ flex: 1, padding: spacing.xl, paddingTop: spacing.xxl }}>
          <Text style={[ty.overline, { color: 'rgba(217,164,65,0.85)' }]}>
{up(tr('today.verseOfDay'))}
          </Text>

          {/* the verse gets a flexible middle that scrolls when it's long; a soft
              bottom fade hints there's more to read without a hard scrollbar */}
          <View style={{ flex: 1, marginTop: spacing.md }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={{ paddingBottom: spacing.lg }}
            >
              <Text
                style={{
                  fontFamily: fonts.serifLight,
                  fontSize: 25,
                  lineHeight: 37,
                  letterSpacing: -0.3,
                  color: '#F2EEE6',
                  marginLeft: -2, // hanging opening quote
                }}
              >
                “{verse.text}”
              </Text>
            </ScrollView>
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(14,18,32,0)', 'rgba(14,18,32,0.92)']}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 24 }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.md,
            }}
          >
            <View style={{ flex: 1, paddingRight: spacing.sm }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: '#D9A441' }}>
                {verse.reference}
              </Text>
              {/* required attribution — see scriptureRights.ts */}
              <Text style={{ fontFamily: fonts.sans, fontSize: 11, lineHeight: 15, color: 'rgba(242,238,230,0.65)', marginTop: 2 }}>
                {credit}
              </Text>
            </View>
            {/* 8dp between the two icon buttons so a near-miss does not shuffle
                the verse when the user meant to share it (roadmap item 22). */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {onShuffle ? (
                <Pressable
                  onPress={onShuffle}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={tr('a11y.anotherVerse')}
                  style={({ pressed }) => ({
                    width: TAP_MIN,
                    height: TAP_MIN,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Ionicons name="shuffle" size={22} color="#F2EEE6" />
                </Pressable>
              ) : null}
              <Pressable
                onPress={share}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={tr('a11y.shareVerse')}
                style={({ pressed }) => ({
                  width: TAP_MIN,
                  height: TAP_MIN,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Ionicons name="share-outline" size={22} color="#F2EEE6" />
              </Pressable>
            </View>
          </View>
        </View>
    </Pressable>
  );
}
