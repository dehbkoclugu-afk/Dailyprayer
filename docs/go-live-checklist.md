# Go-Live Checklist

Everything between "the code is done" and "the app is earning". Ordered. Items
marked **[you]** need a human with accounts/credentials; **[code]** I can do.

## 0. Prerequisites (accounts) — [you]
- [ ] Apple Developer Program membership ($99/yr) → get Apple Team ID + App Store Connect app.
- [ ] Google Play Developer account ($25 one-time).
- [ ] RevenueCat account (free to start).
- [ ] A domain or hosting for the two legal URLs (GitHub Pages works).

## 1. Art assets — [you], then [code] to wire
- [ ] Generate A1–A17 from `docs/asset-briefs.md`.
- [ ] Drop into `src/assets/art/`, register in `src/assets/registry.ts`.
- [ ] App icon (A16) → `assets/icon.png`; splash (A17) → configure in app.json.

## 2. Monetization — [you] set up, [code] wire
- [ ] In RevenueCat: create entitlement `plus`; products `lumen.weekly`,
      `lumen.annual` (with 7-day trial), `lumen.lifetime`.
- [ ] In App Store Connect + Play Console: create the matching IAP/subscription
      products with the same identifiers and localized prices.
- [ ] Put RevenueCat public API keys into `src/services/purchases.ts`
      (`API_KEYS.ios` / `.android`).
- [ ] Build a dev client and verify a sandbox purchase unlocks `isPlus`.

## 3. Legal — [you] finalize
- [ ] Fill `[COMPANY]`, `[CONTACT_EMAIL]`, `[JURISDICTION]` in `src/data/legal.ts`
      and `docs/legal/*.md`.
- [ ] Host `docs/legal/privacy-policy.md` + `terms-of-service.md` at public URLs.
- [ ] Enter the Privacy Policy URL in both store consoles (required).
- [ ] Have the terms/privacy reviewed by a lawyer.

## 4. Store listing — [you] paste, [code] provided
- [ ] Use `docs/store-listing.md` for name/subtitle/keywords/description (6 langs).
- [ ] Capture screenshots from the real app (after art) at required sizes:
      iPhone 6.7" + 6.5"; Android phone. Localize per language if possible.
- [ ] Fill Apple privacy "nutrition labels": data NOT collected (we're local-only;
      RevenueCat collects purchase data — declare per their guide).
- [ ] Age rating questionnaire (no objectionable content → 4+ / Everyone).

## 5. Build & submit — [code] can prep, [you] run with accounts
- [ ] `npm i -g eas-cli && eas login`
- [ ] `eas build:configure` (fills the REPLACE_ fields in `eas.json`).
- [ ] `eas build --platform all --profile production`
- [ ] `eas submit --platform ios` / `--platform android` (or upload manually).
- [ ] TestFlight / Play internal testing pass on a real device.

## 6. Pre-submit QA — [code] mostly done
- [x] Typecheck clean (`npm run typecheck`).
- [x] Unit tests pass (`npm test`) incl. scripture-integrity guard.
- [x] Scripture rights gate passes (`npm run release-gate`) — no bundled edition
      may ship with unverified rights.
- [x] Bundled Scripture matches its manifest (`npm run scripture-check`) — also
      runs in CI and in the APK workflow.
- [ ] Re-run `npm run scripture-drift` (needs network) right before submitting.
      The Turkish YTC is still under review upstream, so its text drifts; decide
      deliberately whether to re-export before shipping.
- [ ] Restore the A17 splash art: `expo-splash-screen` needs a PNG and only
      `src/assets/art/A17-splash.webp` exists. A duplicate plugin entry pointing at
      the missing PNG was breaking `expo prebuild` (and so the APK workflow) and
      has been removed; the app currently falls back to `assets/splash.png`.
- [x] Full flow bug-tested (onboarding → paywall → tabs, EN + TR, dark + light).
- [ ] Re-run the flow on a physical device once art + purchases are wired.
- [ ] Verify restore-purchases works.
- [ ] Verify reminders fire (grant notification permission, set a near time).

## 7. Post-launch — [you] + [code]
- [ ] Add analytics (PostHog/Amplitude) to measure the funnel before price tests.
- [ ] Watch RevenueCat: trial-start %, trial→paid %, churn.
- [ ] A/B the paywall via RevenueCat Offerings (no app update needed).
- [ ] Iterate copy/price from real numbers (targets in `docs/monetization.md`).

## What's NOT blocking launch (v1.1+)
Audio narration for prayers, lock-screen widgets, AI "write my prayer" (needs a
serverless proxy), journal cloud sync, content in more translations.
