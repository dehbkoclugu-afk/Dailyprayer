import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useSheetTitleFocus } from '@/a11y/sheetFocus';
import { useT } from '@/i18n';

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
}

/**
 * A calm bottom-sheet picker — the app's own surface, gold accent and a check
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
}: Props<T>) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const titleRef = useSheetTitleFocus(visible);
  // `title` is a translated string from the caller (roadmap item 33): rendered
  // in caps below, so it needs the app's own locale, not the device's, and not
  // the plain ASCII casing textTransform would apply to a Turkish "i".
  const { up } = useT();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* iOS needs telling that the sheet is modal; on Android the Modal is a
          separate window and TalkBack cannot reach behind it anyway. */}
      <View style={{ flex: 1, backgroundColor: 'rgba(6,8,16,0.6)' }} accessibilityViewIsModal>
        {/* The dim area dismisses on tap and has nothing to announce. As a
            sibling rather than a wrapper it can be hidden from accessibility
            without hiding the sheet — and the sheet no longer needs a Pressable
            of its own to stop taps propagating, which was a second unnamed
            control around the whole content (roadmap item 29). */}
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
            ref={titleRef}
            accessibilityRole="header"
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: t.inkFaint,
              marginBottom: spacing.sm,
            }}
          >
            {up(title)}
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
                      fontFamily: active ? fonts.sansSemiBold : fonts.sans,
                      fontSize: 16,
                      color: active ? t.gold : t.ink,
                    }}
                  >
                    {o.label}
                  </Text>
                  {o.hint ? (
                    <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
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
