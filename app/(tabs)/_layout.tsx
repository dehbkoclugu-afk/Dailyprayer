import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type } from '@/theme/typography';
import { CHROME_SCALE_CAP, useScaledHeight } from '@/theme/textScale';

function TabIcon({ name, selected, color, size }: { name: React.ComponentProps<typeof Ionicons>['name']; selected: boolean; color: string; size: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Ionicons name={name} size={size} color={color} />
      <View style={{ width: selected ? 12 : 0, height: 2, borderRadius: 1, marginTop: 3, backgroundColor: color }} />
    </View>
  );
}

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useT();
  const { width } = useWindowDimensions();
  const expanded = width >= 840;
  // The bar is chrome, so it grows but is capped (roadmap item 30): at 84 flat,
  // an enlarged label was clipped mid-word under the icon; grown linearly it
  // would take a third of the screen away from the content it labels.
  const barHeight = useScaledHeight(84, CHROME_SCALE_CAP);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: expanded ? 'left' : 'bottom',
        tabBarVariant: expanded ? 'material' : 'uikit',
        tabBarStyle: {
          backgroundColor: t.chrome,
          borderTopColor: expanded ? 'transparent' : t.border,
          borderRightColor: expanded ? t.border : 'transparent',
          height: expanded ? undefined : barHeight,
          paddingTop: 8,
          width: expanded ? 96 : undefined,
        },
        tabBarActiveTintColor: t.gold,
        tabBarInactiveTintColor: t.inkFaint,
        tabBarLabelStyle: { ...type.overlineMedium },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: tr('tab.today'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon name={focused ? 'sunny' : 'sunny-outline'} selected={focused} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: tr('tab.bible'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon name={focused ? 'book' : 'book-outline'} selected={focused} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pray"
        options={{
          title: tr('tab.pray'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon name={focused ? 'flame' : 'flame-outline'} selected={focused} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: tr('tab.journal'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon name={focused ? 'create' : 'create-outline'} selected={focused} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr('tab.me'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} selected={focused} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
