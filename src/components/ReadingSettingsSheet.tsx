import React, { useRef } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaledType, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useReaderTheme } from '@/theme/reading';
import { useReaderPrefsStore, FONT_MIN, FONT_MAX } from '@/state/useReaderPrefsStore';
import { useT } from '@/i18n';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

export function ReadingSettingsSheet({
  visible,
  onClose,
  returnFocusHandle,
  sampleText,
  sampleReference,
}: {
  visible: boolean;
  onClose: () => void;
  returnFocusHandle?: number | null;
  sampleText: string;
  sampleReference: string;
}) {
  const t = useReaderTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { fontScale, paper, bumpFont, togglePaper } = useReaderPrefsStore();
  const headingRef = useRef<Text>(null);

  useModalAccessibility(visible, headingRef, returnFocusHandle);

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
      accessibilityState={{ disabled }}
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
      <Text style={{ ...scaledType('titleSmall', size / 24), color: t.ink }}>A</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <ScrollView
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={{
            maxHeight: '90%',
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
          }}
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
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
            ref={headingRef}
            accessible
            accessibilityRole="header"
            style={[ty.bodyMedium, { color: t.ink }]}
          >
            {tr('read.settings')}
          </Text>

          {/* text size */}
          <Text style={[ty.caption, { color: t.inkSoft, marginTop: spacing.lg }]}>
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
              <Text style={[ty.secondaryStrong, { color: t.ink, fontVariant: ['tabular-nums'] }]}>
                {pct}%
              </Text>
            </View>
            {stepBtn(1, tr('a11y.larger'), 26, fontScale >= FONT_MAX - 0.001)}
          </View>

          <View
            accessible
            accessibilityLabel={`${sampleReference}. ${sampleText}`}
            style={{
              marginTop: spacing.md,
              padding: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.bg,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Text style={[ty.overline, { color: t.gold }]}>{sampleReference}</Text>
            <Text
              style={{
                ...scaledType('readerVerse', fontScale),
                color: t.ink,
                marginTop: spacing.sm,
              }}
            >
              {sampleText}
            </Text>
          </View>

          {/* paper tone */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
              marginTop: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.inner,
              backgroundColor: t.surfaceAlt,
              borderWidth: 1,
              borderColor: paper ? t.gold : t.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexGrow: 1, flexBasis: 180 }}>
              <Ionicons name="sunny-outline" size={20} color={paper ? t.gold : t.inkSoft} />
              <Text style={[ty.secondaryMedium, { color: t.ink, flexShrink: 1 }]}>
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
              <Text style={[ty.secondaryMedium, { color: t.ink }]}>
                {tr('scriptureSource.title')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
