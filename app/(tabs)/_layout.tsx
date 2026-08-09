import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { fonts } from '@/theme/typography';

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useT();
  const { width } = useWindowDimensions();
  const expanded = width >= 840;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // A centered 600px bottom bar above 840dp was still a bottom bar —
        // wider, but the same phone pattern stretched out, not Material's
        // own expanded-width guidance for this breakpoint (roadmap item 51).
        // `tabBarPosition`/`tabBarVariant` are @react-navigation/bottom-tabs'
        // own, first-party navigation-rail support: 'left' moves the whole
        // bar to a vertical sidebar (and switches the screen's own layout to
        // a row, content beside it, not underneath it) and the 'material'
        // variant is documented as being for exactly this position.
        tabBarPosition: expanded ? 'left' : 'bottom',
        tabBarVariant: expanded ? 'material' : 'uikit',
        tabBarStyle: {
          backgroundColor: t.chrome,
          borderTopColor: t.border,
          borderRightColor: t.border,
          ...(expanded ? {} : { height: 84, paddingTop: 8 }),
        },
        tabBarActiveTintColor: t.gold,
        tabBarInactiveTintColor: t.inkFaint,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
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
