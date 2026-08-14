import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type as ty } from '@/theme/typography';
import { isExpandedLayout } from '@/lib/adaptiveLayout';
import { resolveMotionPattern } from '@/theme/motion';

interface TabIconProps {
  outline: keyof typeof Ionicons.glyphMap;
  filled: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}

function TabIcon({ outline, filled, focused, color, size }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Ionicons name={focused ? filled : outline} size={size} color={color} />
      <View
        testID="active-tab-marker"
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ width: focused ? 14 : 0, height: 2, borderRadius: 1, backgroundColor: color }}
      />
    </View>
  );
}

export default function TabsLayout() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const { t: tr } = useT();
  const { width } = useWindowDimensions();
  const expanded = isExpandedLayout(width);
  const fadeThrough = resolveMotionPattern('fadeThrough', reduceMotion);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: fadeThrough.animation,
        tabBarStyle: {
          backgroundColor: t.chrome,
          borderTopColor: expanded ? 'transparent' : t.border,
          borderRightColor: expanded ? t.border : 'transparent',
          borderRightWidth: expanded ? 1 : 0,
          width: expanded ? 112 : undefined,
          height: expanded ? '100%' : 84,
          paddingTop: expanded ? 24 : 8,
        },
        tabBarPosition: expanded ? 'left' : 'bottom',
        tabBarLabelPosition: expanded ? 'below-icon' : 'below-icon',
        tabBarActiveTintColor: t.sacredGold,
        tabBarInactiveTintColor: t.inkFaint,
        tabBarLabelStyle: ty.labelSmallMedium,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: tr('tab.today'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon outline="sunny-outline" filled="sunny" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: tr('tab.bible'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon outline="book-outline" filled="book" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pray"
        options={{
          title: tr('tab.pray'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon outline="flame-outline" filled="flame" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: tr('tab.journal'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon outline="create-outline" filled="create" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr('tab.me'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon outline="person-outline" filled="person" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
