import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { spacing } from '@/theme/tokens';

export function SectionHeader({
  title,
  right,
  style,
}: {
  title: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xxl,
        marginBottom: spacing.md,
        ...style,
      }}
    >
      <Text numberOfLines={1} style={{ ...ty.subheading, color: t.ink, flex: 1, flexShrink: 1 }}>{title}</Text>
      {right ? <View style={{ marginLeft: spacing.sm, flexShrink: 0 }}>{right}</View> : null}
    </View>
  );
}
