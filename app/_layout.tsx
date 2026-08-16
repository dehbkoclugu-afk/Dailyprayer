import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform, useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { ToastHost } from '@/components/ToastHost';
import { useTheme } from '@/hooks/useTheme';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { initPurchases, refreshEntitlement } from '@/services/purchases';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { loadInstalledBiblePack } from '@/services/biblePacks';
import { registerDownloadedBiblePack } from '@/data/bibleFull';
import { isBundledScriptureLocale, resolveSystemScriptureLocale } from '@/i18n/scripture';
import { resolveLocale, resolveRequestedApplicationLocale } from '@/i18n';
import { getApplicationDirection } from '@/i18n/direction';
import {
  BUNDLED_APPLICATION_CONTENT_LOCALES,
  restoreInstalledApplicationLocale,
} from '@/i18n/applicationLanguageActivation';
import { registerApplicationContentPack } from '@/i18n/applicationContent';
import { loadInstalledApplicationContentPack } from '@/services/applicationContentPacks';
import { resolveMotionPattern } from '@/theme/motion';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const scheme = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  const language = useUserStore((s) => s.language);
  const [loaded, fontError] = useFonts({
    // Ionicons glyph font , without this the icons render blank in release
    // builds (empty buttons, missing chevrons/play controls).
    ...Ionicons.font,
    Fraunces_400Regular: require('@expo-google-fonts/fraunces/Fraunces_400Regular.ttf'),
    Fraunces_600SemiBold: require('@expo-google-fonts/fraunces/Fraunces_600SemiBold.ttf'),
    Figtree_400Regular: require('@expo-google-fonts/figtree/Figtree_400Regular.ttf'),
    Figtree_500Medium: require('@expo-google-fonts/figtree/Figtree_500Medium.ttf'),
    Figtree_600SemiBold: require('@expo-google-fonts/figtree/Figtree_600SemiBold.ttf'),
    Figtree_700Bold: require('@expo-google-fonts/figtree/Figtree_700Bold.ttf'),
  });

  // Gate rendering on font readiness, but NEVER hang on the splash: proceed when
  // fonts load, when they error, or after a short failsafe timeout. A release
  // build that stalls loading fonts would otherwise sit on the splash forever
  // (the emulator smoke test can't catch this , the process stays alive).
  const [ready, setReady] = useState(false);
  const [scriptureReady, setScriptureReady] = useState(false);
  const [applicationContentReady, setApplicationContentReady] = useState(false);
  useEffect(() => {
    if (loaded || fontError) setReady(true);
  }, [loaded, fontError]);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const restoreScripture = () => {
      const user = useUserStore.getState();
      const preference = user.scriptureLocale;
      const scripture = preference === 'system' ? resolveSystemScriptureLocale() : preference;
      if (isBundledScriptureLocale(scripture)) {
        if (active) setScriptureReady(true);
        return;
      }
      loadInstalledBiblePack(scripture)
        .then((pack) => {
          if (pack) registerDownloadedBiblePack(pack);
          else if (preference !== 'system') user.setScriptureLocale('system');
        })
        .catch(() => {
          if (preference !== 'system') user.setScriptureLocale('system');
        })
        .finally(() => {
          if (active) setScriptureReady(true);
        });
    };

    if (useUserStore.persist.hasHydrated()) restoreScripture();
    else unsubscribe = useUserStore.persist.onFinishHydration(restoreScripture);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const restoreApplicationContent = () => {
      const user = useUserStore.getState();
      const locale = resolveRequestedApplicationLocale(user.language);
      if ((BUNDLED_APPLICATION_CONTENT_LOCALES as readonly string[]).includes(locale)) {
        if (active) setApplicationContentReady(true);
        return;
      }
      restoreInstalledApplicationLocale(locale, {
        loadInstalled: loadInstalledApplicationContentPack,
        register: registerApplicationContentPack,
      })
        .finally(() => {
          if (active) setApplicationContentReady(true);
        });
    };

    if (useUserStore.persist.hasHydrated()) restoreApplicationContent();
    else unsubscribe = useUserStore.persist.onFinishHydration(restoreApplicationContent);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let lifecycleReady = false;
    let midnightTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribers: (() => void)[] = [];

    const afterHydration = (store: typeof useStreakStore | typeof useEntitlementStore | typeof useUserStore) =>
      new Promise<void>((resolve) => {
        if (store.persist.hasHydrated()) return resolve();
        const unsubscribe = store.persist.onFinishHydration(() => {
          unsubscribe();
          resolve();
        });
        unsubscribers.push(unsubscribe);
      });

    const refreshDay = () => {
      useStreakStore.getState().tickToday();
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 1, 0);
      if (midnightTimer) clearTimeout(midnightTimer);
      midnightTimer = setTimeout(() => {
        if (active) refreshDay();
      }, Math.max(1000, next.getTime() - now.getTime()));
    };

    void Promise.all([
      afterHydration(useUserStore),
      afterHydration(useStreakStore),
      afterHydration(useEntitlementStore),
    ]).then(() => {
      if (!active) return;
      lifecycleReady = true;
      refreshDay();
      void initPurchases();
      const { prayerTime } = useUserStore.getState().quiz;
      if (prayerTime && prayerTime !== 'none') {
        import('@/services/notifications')
          .then((n) => n.scheduleStreakSave(useStreakStore.getState().count))
          .catch(() => {});
      }
    });

    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !active || !lifecycleReady) return;
      refreshDay();
      void refreshEntitlement();
    });

    return () => {
      active = false;
      appState.remove();
      if (midnightTimer) clearTimeout(midnightTimer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (ready && scriptureReady && applicationContentReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [applicationContentReady, ready, scriptureReady]);

  // Web static export renders build-time HTML with default state; persisted
  // stores + locale only exist client-side, so hydrate after mount to avoid
  // React hydration mismatches. No-op on native.
  const [mounted, setMounted] = useState(Platform.OS !== 'web');
  useEffect(() => setMounted(true), []);

  // Render marker for the smoke test , a stuck splash never logs this.
  useEffect(() => {
    if (ready && mounted && scriptureReady && applicationContentReady) {
      console.log('LUMEN_UI_READY');
    }
  }, [applicationContentReady, ready, mounted, scriptureReady]);

  if (!ready || !mounted || !scriptureReady || !applicationContentReady) return null;

  const dark = pref === 'system' ? scheme !== 'light' : pref === 'vigil';
  const direction = getApplicationDirection(resolveLocale(language));
  const sharedAxisMotion = resolveMotionPattern('sharedAxis', reduceMotion);
  const containerMotion = resolveMotionPattern('container', reduceMotion);

  return (
    <GestureHandlerRootView style={{ flex: 1, direction }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={({ route }) => ({
          headerShown: false,
          contentStyle: { backgroundColor: t.bg, direction },
          animation: route.name === 'paywall' || route.name === 'player'
            ? containerMotion.animation
            : sharedAxisMotion.animation,
        })}
      >
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="player" options={{ presentation: 'modal' }} />
        <Stack.Screen name="devotional" options={{ presentation: 'card' }} />
        <Stack.Screen name="legal" options={{ presentation: 'card' }} />
        <Stack.Screen name="plan" options={{ presentation: 'card' }} />
        <Stack.Screen name="scripture-language" options={{ presentation: 'card' }} />
        <Stack.Screen name="scripture-source" options={{ presentation: 'card' }} />
        <Stack.Screen name="application-language" options={{ presentation: 'card' }} />
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}
