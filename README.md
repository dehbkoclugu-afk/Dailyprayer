# Selaora — Daily Prayer & Bible

A premium, subscription-first daily prayer & Bible app for iOS and Android,
built with Expo (React Native + TypeScript). Its design and funnel are a
synthesis of the top-grossing apps in the category — Hallow's calm audio-first
sanctuary, Bible Chat's personalization-quiz funnel, YouVersion's streak/verse
retention loop, Glorify's daily ritual stack.

## Docs

| Doc | Contents |
|-----|----------|
| [docs/research.md](docs/research.md) | Top-10 grossing Bible-app teardown & pattern analysis |
| [docs/design-system.md](docs/design-system.md) | "Sanctum" visual language: tokens, type, motion |
| [docs/architecture.md](docs/architecture.md) | Stack choice, project layout, principles, roadmap |
| [docs/monetization.md](docs/monetization.md) | Funnel, pricing, free-vs-Plus split, KPIs |

## Run it

```bash
npm install
npx expo start        # scan QR with Expo Go, or press i / a
npm run typecheck
npm test              # unit + store tests (node:test)
npm run test:tz       # same suite under DST time zones
```

Purchases run in **mock mode** in development (no RevenueCat keys) — the whole
onboarding → paywall → Plus funnel is testable in Expo Go; "purchasing" grants
the entitlement locally. Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` /
`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (see `.env.example`) and
create the `plus` entitlement in RevenueCat before release builds.

## What's implemented (v1)

- **Onboarding funnel**: welcome → name → 5-step personalization quiz with
  social-proof interstitials → "building your plan" beat → personalized reveal
  → paywall (trial toggle, annual default, dismiss discount offer, charity
  reframe post-purchase).
- **Today**: greeting, app-open streak flame (breathing animation), daily
  completion ring, verse-of-the-day card (shareable), devotional, guided
  prayer, gratitude — the four-step daily ritual.
- **Bible**: full offline reader (WEB, YTC, RV1909, Luther 1912 bundled; more
  editions as checksum-verified downloads), search, bookmarks, highlights,
  premium reading plans.
- **Pray**: categorized guided-prayer library with Plus gating and a paced
  full-screen player (audio narration slots in later).
- **Journal**: gratitude + prayer requests with "answered" states.
- **Profile**: stats, theme (Vigil/Dawn/auto), subscription management.
- Local notifications: chosen prayer-time reminder + an evening streak-save
  nudge (skipped on days a ritual step is already done).
- Dual themes, Fraunces/Figtree typography, reduce-motion support,
  accessibility labels, 44pt touch targets.

## Before store submission

1. RevenueCat keys + an offering with monthly, annual and lifetime packages
   (entitlement `plus`).
2. App icons/splash (assets), screenshots, store listings.
3. Fill the `REPLACE_WITH_…` Apple fields in `eas.json` (submit profile).
4. `eas build` profiles + store accounts; privacy labels (no tracking in v1).
