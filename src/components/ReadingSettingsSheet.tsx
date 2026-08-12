import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useReaderTheme } from '@/theme/reading';
import { useReaderPrefsStore, FONT_MIN, FONT_MAX } from '@/state/useReaderPrefsStore';
import { useT } from '@/i18n';

export function ReadingSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useReaderTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { fontScale, paper, bumpFont, togglePaper } = useReaderPrefsStore();

  const tap = () => Haptics.selectionAsync().catch(() => {});
  const pct = Math.round(fontScale * 100);

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
      accessibilityLabel={label}
      style={{
        width: 56,
        height: 56,
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={tr('a11y.close')} />
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

          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
            {tr('read.settings')}
          </Text>

          {/* text size */}
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkSoft, marginTop: spacing.lg }}>
            {tr('read.textSize')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
            {stepBtn(-1, tr('a11y.smaller'), 16, fontScale <= FONT_MIN + 0.001)}
            <View
              style={{
                flex: 1,
                height: 56,
                borderRadius: radius.inner,
                backgroundColor: t.surfaceAlt,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.ink, fontVariant: ['tabular-nums'] }}>
                {pct}%
              </Text>
            </View>
            {stepBtn(1, tr('a11y.larger'), 26, fontScale >= FONT_MAX - 0.001)}
          </View>

          {/* paper tone */}
          <Pressable
            onPress={() => {
              tap();
              togglePaper();
            }}
            accessibilityRole="switch"
            accessibilityState={{ checked: paper }}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="sunny-outline" size={20} color={paper ? t.gold : t.inkSoft} />
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.ink }}>
                {tr('read.paperMode')}
              </Text>
            </View>
            <View
              style={{
                width: 46,
                height: 28,
                borderRadius: 14,
                padding: 3,
                backgroundColor: paper ? t.gold : t.border,
                alignItems: paper ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: paper ? t.onGold : t.surface }} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              tap();
              onClose();
              router.push('/scripture-source');
            }}
            accessibilityRole="button"
            accessibilityLabel={tr('scriptureSource.title')}
            style={({ pressed }) => ({
              minHeight: 48,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: t.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Ionicons name="information-circle-outline" size={20} color={t.inkSoft} />
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: t.ink }}>
                {tr('scriptureSource.title')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
