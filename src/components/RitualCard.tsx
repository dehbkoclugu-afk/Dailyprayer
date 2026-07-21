import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  done: boolean;
  locked?: boolean;
  onPress: () => void;
}

export function RitualCard({ icon, title, subtitle, done, locked, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${done ? ', completed' : locked ? ', locked' : ''}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: done ? t.gold : t.border,
        padding: spacing.lg,
        gap: spacing.lg,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.inner,
          backgroundColor: done ? t.goldSoft : t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={done ? t.gold : t.inkSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color: t.ink }}>
          {title}
        </Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: t.inkSoft, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
      {done ? (
        <Ionicons name="checkmark-circle" size={26} color={t.gold} />
      ) : locked ? (
        <Ionicons name="lock-closed-outline" size={22} color={t.inkFaint} />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={t.inkFaint} />
      )}
    </Pressable>
  );
}
