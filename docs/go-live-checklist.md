# Go-Live Checklist

Everything between "the code is done" and "the app is earning". Ordered. Items
marked **[you]** need a human with accounts/credentials; **[code]** I can do.

## 0. Prerequisites (accounts) — [you]
- [ ] Apple Developer Program membership ($99/yr) → get Apple Team ID + App Store Connect app.
- [ ] Google Play Developer account ($25 one-time).
- [ ] RevenueCat account (free to start).
- [ ] A domain or hosting for the two legal URLs (GitHub Pages works).

## 1. Art assets
- [x] A1–A20 are generated and registered.
- [x] App icon and splash are wired in `app.json`.
- [x] 1024×500 Play feature graphic is ready in `docs/play-store/assets/`.
- [ ] Capture signed-release screenshots using `docs/play-store/screenshots.md`.

## 2. Monetization — [you] set up, [code] wire
- [ ] In RevenueCat: create entitlement `plus`; products `lumen.weekly`,
      `lumen.annual` (with 7-day trial), `lumen.lifetime`.
- [ ] In App Store Connect + Play Console: create the matching IAP/subscription
      products with the same identifiers and localized prices.
- [ ] Put RevenueCat public SDK keys in EAS/GitHub environment secrets.
- [ ] Build a dev client and verify a sandbox purchase unlocks `isPlus`.

## 3. Legal — [you] finalize
- [x] Legal entity, contact and jurisdiction are filled in the in-app and hosted copy.
- [x] Static Privacy, Terms and Support pages plus GitHub Pages workflow are ready.
- [ ] Enable GitHub Pages and confirm the deployed public URLs.
- [ ] Enter the Privacy Policy URL in both store consoles (required).
- [ ] Have the terms/privacy reviewed by a lawyer.

## 4. Store listing — [you] paste, [code] provided
- [x] `docs/store-listing.md` contains accurate copy in six languages.
- [x] `docs/play-store/play-console-declarations.md` contains the Play answers.
- [ ] Capture screenshots from the signed real app at required sizes.
- [ ] Fill Apple privacy "nutrition labels": data NOT collected (we're local-only;
      RevenueCat collects purchase data — declare per their guide).
- [ ] Age rating questionnaire (no objectionable content → 4+ / Everyone).

## 5. Build & submit — [code] can prep, [you] run with accounts
- [ ] `npm i -g eas-cli && eas login`
- [ ] Create the Play Console app and confirm `com.lumen.dailyprayer` is available.
- [ ] Link the EAS project, generate/retain its first Android upload key, and add
      `EXPO_TOKEN` plus RevenueCat public keys.
- [ ] Run the `Android production AAB` workflow or
      `eas build --platform android --profile production`.
- [ ] `eas submit --platform ios` / `--platform android` (or upload manually).
- [ ] TestFlight / Play internal testing pass on a real device.

## 6. Pre-submit QA — [code] mostly done
- [x] Typecheck clean (`npm run typecheck`).
- [x] Unit tests pass (`npm test`) incl. scripture-integrity guard.
- [x] **`npm run release-check` passes.** Source release requirement:
      Scripture integrity + Scripture rights gate + copy accuracy. The APK workflow
      runs it before building, so none of the three can be skipped.
      - `scripture-check` — bundled Scripture matches the manifest (also in CI).
      - `release-gate` — no bundled edition ships with unverified rights.
      - `release-claims` — the 17 licence/price/trial/notification/privacy claims
        the app makes are backed by the code (also in CI).
- [x] Artifact size is a separate post-export gate:
      `npm run release-artifact-check -- dist-android`.
- [ ] Re-run `npm run scripture-drift` (needs network) right before submitting.
      The Turkish YTC is still under review upstream, so its text drifts; decide
      deliberately whether to re-export before shipping.
- [x] Expo splash uses the valid `assets/splash.png` release asset.
- [x] Full flow bug-tested (onboarding → paywall → tabs, EN + TR, dark + light).
- [ ] Re-run the flow on a physical device once art + purchases are wired.
- [ ] Verify restore-purchases works.
- [ ] Verify reminders fire (grant notification permission, set a near time).

## 7. Post-launch — [you] + [code]
- [ ] Add analytics (PostHog/Amplitude) to measure the funnel before price tests.
      **This changes what the app may claim.** The Privacy Policy currently says
      "We do **not** use third-party advertising or tracking" and "no analytics",
      so `npm run release-claims` will fail the moment such a dependency lands —
      by design. Update the policy, the store privacy labels and the claim check
      together with the SDK, in the same change.
- [ ] Watch RevenueCat: trial-start %, trial→paid %, churn.
- [ ] A/B the paywall via RevenueCat Offerings (no app update needed).
- [ ] Iterate copy/price from real numbers (targets in `docs/monetization.md`).

## What's NOT blocking launch (v1.1+)
Audio narration for prayers, lock-screen widgets, AI "write my prayer" (needs a
serverless proxy), journal cloud sync, content in more translations.
