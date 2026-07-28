import React from 'react';
import { Modal, Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { fonts, type } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useScaledHeight } from '@/theme/textScale';
import { useReaderTheme } from '@/theme/reading';
import { useReaderPrefsStore, FONT_MIN, FONT_MAX } from '@/state/useReaderPrefsStore';
import { useT } from '@/i18n';
import { useSheetTitleFocus } from '@/a11y/sheetFocus';

export function ReadingSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useReaderTheme();
  const reduceMotion = useReducedMotion();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { fontScale, paper, bumpFont, togglePaper } = useReaderPrefsStore();
  const titleRef = useSheetTitleFocus(visible);

  const tap = () => Haptics.selectionAsync().catch(() => {});
  const pct = Math.round(fontScale * 100);
  // The two steppers and the percentage between them share a row and each holds
  // text, so the row grows with the OS text setting (roadmap item 30). At 200%
  // the serif "A" and "100%" overflowed a flat 56.
  const controlSize = useScaledHeight(56);

  const stepBtn = (dir: 1 | -1, label: string, size: number, disabled: boolean) => (
    <Pressable
      onPress={
        disabled
          ? undefined
          : () => {
              tap();
              bumpFont(dir);
            }
      }
      disabled={disabled}
      accessibilityRole="button"
      // At the limit the button only dims. RN's Pressable already reports the
      // disabled state from the prop, but not why — so the label carries the
      // reason, the same as the reader's chapter arrows.
      accessibilityLabel={
        disabled
          ? `${label}, ${tr(dir === 1 ? 'a11y.textAtLargest' : 'a11y.textAtSmallest')}`
          : label
      }
      style={{
        width: controlSize,
        height: controlSize,
        borderRadius: radius.inner,
        backgroundColor: t.surfaceAlt,
        borderWidth: 1,
        borderColor: t.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ fontFamily: fonts.serif, fontSize: size, color: t.ink }}>A</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* iOS needs telling that the sheet is modal; on Android the Modal is a
          separate window and TalkBack cannot reach behind it anyway. */}
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
        <View
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.border,
              marginBottom: spacing.lg,
            }}
          />

          <Text
            ref={titleRef}
            accessibilityRole="header"
            style={{ ...type.bodySemi, color: t.ink }}
          >
            {tr('read.settings')}
          </Text>

          {/* text size */}
          <Text style={{ ...type.labelMedium, color: t.inkSoft, marginTop: spacing.lg }}>
            {tr('read.textSize')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
            {stepBtn(-1, tr('a11y.smaller'), 16, fontScale <= FONT_MIN + 0.001)}
            <View
              style={{
                flex: 1,
                height: controlSize,
                borderRadius: radius.inner,
                backgroundColor: t.surfaceAlt,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...type.calloutSemi, color: t.ink, fontVariant: ['tabular-nums'] }}>
                {pct}%
              </Text>
            </View>
            {stepBtn(1, tr('a11y.larger'), 26, fontScale >= FONT_MAX - 0.001)}
          </View>

          <View
            accessible
            accessibilityLabel={tr('read.preview')}
            style={{
              marginTop: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.bg,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.serifLight,
                fontSize: Math.round(18 * fontScale),
                lineHeight: Math.round(28 * fontScale),
                color: t.ink,
              }}
            >
              {tr('read.preview')}
            </Text>
          </View>

          {/* paper tone */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.lg,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: paper ? t.gold : t.border,
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="sunny-outline" size={20} color={paper ? t.gold : t.inkSoft} />
              <Text style={{ ...type.calloutMedium, color: t.ink, flex: 1 }}>
                {tr('read.paperMode')}
              </Text>
            </View>
            <Switch
              value={paper}
              onValueChange={() => {
                tap();
                togglePaper();
              }}
              accessibilityLabel={tr('read.paperMode')}
              trackColor={{ false: t.border, true: t.gold }}
              thumbColor={paper ? t.onGold : t.surface}
            />
          </View>

          {/* text source — full edition, license and attribution (roadmap item 12).
              Licensed editions require this to be reachable from the reader, not
              only implied by the one-line credit under the chapter. */}
          <Pressable
            onPress={() => {
              tap();
              onClose();
              router.push('/source');
            }}
            accessibilityRole="button"
            accessibilityLabel={tr('read.textSource')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.md,
              minHeight: 56,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: t.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
              <Ionicons name="document-text-outline" size={20} color={t.inkSoft} />
              <Text style={{ ...type.calloutMedium, color: t.ink }}>
                {tr('read.textSource')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
