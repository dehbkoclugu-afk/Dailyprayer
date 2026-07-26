import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastHost } from '@/components/ToastHost';
import { useTheme } from '@/hooks/useTheme';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { initPurchases } from '@/services/purchases';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const scheme = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  const [loaded, fontError] = useFonts({
    // Ionicons glyph font — without this the icons render blank in release
    // builds (empty buttons, missing chevrons/play controls).
    ...Ionicons.font,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  // Gate rendering on font readiness, but NEVER hang on the splash: proceed when
  // fonts load, when they error, or after a short failsafe timeout. A release
  // build that stalls loading fonts would otherwise sit on the splash forever
  // (the emulator smoke test can't catch this — the process stays alive).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (loaded || fontError) setReady(true);
  }, [loaded, fontError]);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    initPurchases();
    // App-open streak tick (YouVersion pattern): opening the app keeps the flame lit.
    const streak = useStreakStore.getState();
    streak.tickToday();
    // Keep the evening streak-save notification referencing the live count —
    // only for users who opted into reminders.
    const { prayerTime } = useUserStore.getState().quiz;
    if (prayerTime && prayerTime !== 'none') {
      import('@/services/notifications')
        .then((n) => n.scheduleStreakSave(useStreakStore.getState().count))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Web static export renders build-time HTML with default state; persisted
  // stores + locale only exist client-side, so hydrate after mount to avoid
  // React hydration mismatches. No-op on native.
  const [mounted, setMounted] = useState(Platform.OS !== 'web');
  useEffect(() => setMounted(true), []);

  // Render marker for the smoke test — a stuck splash never logs this.
  useEffect(() => {
    if (ready && mounted) console.log('LUMEN_UI_READY');
  }, [ready, mounted]);

  if (!ready || !mounted) return null;

  const dark = pref === 'system' ? scheme !== 'light' : pref === 'vigil';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="player" options={{ presentation: 'modal' }} />
        <Stack.Screen name="devotional" options={{ presentation: 'card' }} />
        <Stack.Screen name="legal" options={{ presentation: 'card' }} />
        <Stack.Screen name="source" options={{ presentation: 'card' }} />
        <Stack.Screen name="plan" options={{ presentation: 'card' }} />
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}
