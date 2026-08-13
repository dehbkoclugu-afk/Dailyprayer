import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type as ty } from '@/theme/typography';

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.chrome,
          borderTopColor: t.border,
          height: 84,
          paddingTop: 8,
        },
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
