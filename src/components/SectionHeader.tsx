import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
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
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 20, color: t.ink }}>{title}</Text>
      {right}
    </View>
  );
}
