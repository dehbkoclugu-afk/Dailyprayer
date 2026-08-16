import React, { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

export interface SheetOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  visible: boolean;
  title: string;
  options: SheetOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  returnFocusHandle?: number | null;
}

/**
 * A calm bottom-sheet picker , the app's own surface, gold accent and a check
 * on the current choice. Replaces the jarring native Alert for settings that
 * are really single-select lists (theme, language).
 */
export function OptionSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  returnFocusHandle,
}: Props<T>) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const headingRef = useRef<Text>(null);

  useModalAccessibility(visible, headingRef, returnFocusHandle);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', inset: 0 }}
        />
        <View
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: t.border,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          }}
        >
          {/* grabber */}
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
            style={{
              ...ty.captionStrong,
              letterSpacing: 1.5,
              color: t.inkFaint,
              marginBottom: spacing.sm,
            }}
          >
            {title}
          </Text>
          {options.map((o, i) => {
            const active = o.value === selected;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onSelect(o.value);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={o.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.lg,
                  minHeight: 56,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: t.border,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...ty.bodyCompact,
                      fontFamily: active ? fonts.sansSemiBold : fonts.sans,
                      color: active ? t.gold : t.ink,
                    }}
                  >
                    {o.label}
                  </Text>
                  {o.hint ? (
                    <Text style={{ ...ty.captionRegular, color: t.inkSoft, marginTop: 2 }}>
                      {o.hint}
                    </Text>
                  ) : null}
                </View>
                {active ? <Ionicons name="checkmark" size={22} color={t.gold} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
