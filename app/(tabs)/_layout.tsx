import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type as ty } from '@/theme/typography';
import { isExpandedLayout } from '@/lib/adaptiveLayout';

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useT();
  const { width } = useWindowDimensions();
  const expanded = isExpandedLayout(width);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        tabBarActiveTintColor: t.gold,
        tabBarInactiveTintColor: t.inkFaint,
        tabBarLabelStyle: ty.labelSmallMedium,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: tr('tab.today'),
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: tr('tab.bible'),
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pray"
        options={{
          title: tr('tab.pray'),
          tabBarIcon: ({ color, size }) => <Ionicons name="flame-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: tr('tab.journal'),
          tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr('tab.me'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
