# Architecture

## Stack decision

**Expo (React Native) + TypeScript**, expo-router.

Why over Flutter/native: one codebase for iOS+Android, first-class OTA updates (EAS Update)
to iterate paywalls without store review, RevenueCat's best-supported SDK, huge hiring pool,
and Expo's config-plugin ecosystem for widgets/notifications. The app is content+CRUD+audio —
nothing demanding native performance.

## Libraries

| Concern | Choice | Why |
|---------|--------|-----|
| Routing | `expo-router` v5 | file-based, typed routes, deep links for notifications |
| State | `zustand` + `AsyncStorage` persist | tiny, no boilerplate; per-domain stores |
| Animation | `react-native-reanimated` | 60fps on UI thread, springs |
| Payments | `react-native-purchases` (RevenueCat) | receipt validation, trials, price tests, both stores |
| Notifications | `expo-notifications` | local daily reminders + streak-save |
| Fonts | `@expo-google-fonts/fraunces`, `figtree` | design system |
| Icons | `@expo/vector-icons` (Ionicons) | no extra dep |
| Haptics | `expo-haptics` | completion feedback |
| Gradients/Blur | `expo-linear-gradient`, `expo-blur` | verse cards, paywall |

## Project layout

```
app/                      # expo-router routes (thin — screens compose src/)
  _layout.tsx             # fonts, theme provider, gate (onboarding vs tabs)
  index.tsx               # redirect by onboarding state
  onboarding/             # welcome → quiz → building → reveal
  paywall.tsx             # modal, reusable from anywhere
  (tabs)/                 # today · bible · pray · journal · profile
  player.tsx              # audio-style guided prayer player (modal)
src/
  theme/                  # tokens.ts (colors/spacing/radius), typography.ts
  components/             # design-system components (dumb, themed)
  data/                   # static content: verses, devotionals, prayers, quiz, plans, bible
  state/                  # zustand stores: user, streak, journal, entitlement
  services/               # purchases.ts (RevenueCat wrapper), notifications.ts, share.ts
  hooks/                  # useTheme, useDailyContent, useEntitlement
  lib/                    # dates.ts (day keys, streak math), format.ts
docs/                     # this documentation
```

### Principles

- **Routes are thin**: `app/*` files only compose components from `src/` — screens testable
  without navigation.
- **Design tokens only**: no raw hex in components; everything reads `useTheme()`.
- **Content as data**: verses/devotionals/prayers are typed JSON-ish modules today, swapped
  for a CMS/API later behind the same `useDailyContent()` hook. Day-of-year indexing gives
  365-day rotation with zero backend.
- **Monetization isolated**: `services/purchases.ts` wraps RevenueCat behind an interface;
  in Expo Go / dev it falls back to a mock so the whole app runs without native modules.
  Entitlement state lives in one store; components ask `isPlus`, never the SDK.
- **Streak math is pure**: `lib/dates.ts` — local-date keys, `tickToday()`, grace handling —
  unit-testable, no Date.now() sprinkled around.

## Backend roadmap (not in v1 codebase)

v1 ships **offline-first, zero backend** (fastest path to store + no server cost).
- Phase 2: Supabase (auth, journal sync, prayer-request community feed).
- Phase 3: AI prayer/chat via a thin serverless proxy (Claude API) with scripture grounding;
  never call the LLM key from the client.
- Analytics: PostHog or Amplitude via Expo plugin; RevenueCat webhooks → dashboard.

## Store/native work checklist

- EAS Build profiles (`eas.json`), bundle ids `com.lumen.dailyprayer`.
- RevenueCat: create `plus` entitlement, `$rc_annual` / `$rc_weekly` / lifetime products.
- Widgets (verse of the day): iOS WidgetKit + Android Glance via config plugins (phase 2).
- Push: local-only in v1 (no server needed for reminders).
