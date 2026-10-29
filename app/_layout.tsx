import React, { useEffect, useState } from 'react';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, I18nManager, Platform, Pressable, Text, View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useReducedMotion } from 'react-native-reanimated';
import { ToastHost } from '@/components/ToastHost';
import { useTheme } from '@/hooks/useTheme';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { waitForHydration } from '@/state/hydration';
import { initPurchases } from '@/services/purchases';
import { syncReminders } from '@/services/notifications';
import { dayKey } from '@/lib/dates';
import { type as ty } from '@/theme/typography';
import { reportError } from '@/lib/reportError';
import { loadInstalledBiblePack } from '@/services/biblePacks';
import { registerDownloadedBiblePack } from '@/data/bibleFull';
import { isBundledScriptureLocale, resolveSystemScriptureLocale } from '@/i18n/scripture';
import { resolveLocale, resolveRequestedApplicationLocale, translate } from '@/i18n';
import { getApplicationDirection, isApplicationRTL } from '@/i18n/direction';
import {
  BUNDLED_APPLICATION_CONTENT_LOCALES,
  restoreInstalledApplicationLocale,
} from '@/i18n/applicationLanguageActivation';
import { registerApplicationContentPack } from '@/i18n/applicationContent';
import { loadInstalledApplicationContentPack } from '@/services/applicationContentPacks';
import { resolveMotionPattern } from '@/theme/motion';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Keys of retired stores; removed once so they don't linger on devices. */
const RETIRED_STORAGE_KEYS = ['lumen-bible'];

function reminderState() {
  const streak = useStreakStore.getState();
  return {
    prayerTime: useUserStore.getState().quiz.prayerTime,
    doneToday: streak.doneDay === dayKey() && streak.doneSteps.length > 0,
  };
}

/** Rendered by Expo Router when any screen throws, instead of a blank app. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const t = useTheme();
  useEffect(() => reportError(error, 'render'), [error]);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
      <Text accessibilityRole="header" style={{ ...ty.titleSmall, color: t.ink, textAlign: 'center' }}>
        {translate('error.title')}
      </Text>
      <Text style={{ ...ty.secondary, color: t.inkSoft, textAlign: 'center' }}>
        {translate('error.body')}
      </Text>
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        style={{ marginTop: 12, minHeight: 48, paddingHorizontal: 24, borderRadius: 999, backgroundColor: t.gold, justifyContent: 'center' }}
      >
        <Text style={{ ...ty.bodyCompactStrong, color: t.onGold }}>{translate('error.retry')}</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const scheme = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  const language = useUserStore((s) => s.language);
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
        .catch((error) => {
          reportError(error, 'restore-scripture-pack');
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
        .catch(() => false)
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

  // Startup work that depends on persisted state runs only after every store
  // has hydrated — otherwise the app-open streak tick and reminder sync would
  // act on defaults and then be overwritten by the stored values.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    let active = true;
    waitForHydration().then(() => {
      if (!active) return;
      setHydrated(true);
      initPurchases();
      // App-open streak tick (YouVersion pattern): opening the app keeps the flame lit.
      useStreakStore.getState().tickToday();
      syncReminders(reminderState()).catch((error) => reportError(error, 'reminders'));
      AsyncStorage.multiRemove(RETIRED_STORAGE_KEYS).catch(() => {});
    });
    return () => {
      active = false;
    };
  }, []);

  // A new day can begin while the app sits in the background: tick again and
  // refresh reminders whenever it returns to the foreground.
  useEffect(() => {
    if (!hydrated) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      useStreakStore.getState().tickToday();
      syncReminders(reminderState()).catch((error) => reportError(error, 'reminders'));
    });
    return () => subscription.remove();
  }, [hydrated]);

  // Re-render notification copy in the new language, and drop today's evening
  // nudge as soon as a ritual step is completed.
  useEffect(() => {
    if (!hydrated) return;
    const resync = () => {
      syncReminders(reminderState()).catch((error) => reportError(error, 'reminders'));
    };
    const unsubscribeUser = useUserStore.subscribe((state, previous) => {
      if (state.language !== previous.language || state.quiz.prayerTime !== previous.quiz.prayerTime) resync();
    });
    const unsubscribeStreak = useStreakStore.subscribe((state, previous) => {
      if (state.doneDay !== previous.doneDay || state.doneSteps.length !== previous.doneSteps.length) resync();
    });
    return () => {
      unsubscribeUser();
      unsubscribeStreak();
    };
  }, [hydrated]);

  // Inline `direction` mirrors this session immediately; native chrome (tab bar,
  // gestures, modals) follows I18nManager, which applies from the next launch.
  const rtl = isApplicationRTL(resolveLocale(language));
  useEffect(() => {
    if (Platform.OS === 'web' || I18nManager.isRTL === rtl) return;
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }, [rtl]);

  useEffect(() => {
    if (ready && hydrated && scriptureReady && applicationContentReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [applicationContentReady, hydrated, ready, scriptureReady]);

  // Web static export renders build-time HTML with default state; persisted
  // stores + locale only exist client-side, so hydrate after mount to avoid
  // React hydration mismatches. No-op on native.
  const [mounted, setMounted] = useState(Platform.OS !== 'web');
  useEffect(() => setMounted(true), []);

  // Render marker for the smoke test — a stuck splash never logs this.
  useEffect(() => {
    if (ready && hydrated && mounted && scriptureReady && applicationContentReady) {
      console.log('SELAORA_UI_READY');
    }
  }, [applicationContentReady, hydrated, ready, mounted, scriptureReady]);

  if (!ready || !hydrated || !mounted || !scriptureReady || !applicationContentReady) return null;

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
