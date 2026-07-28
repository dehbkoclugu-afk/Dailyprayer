# Google Play production handoff

Repository-owned release work is automated. Items marked **Console** require the
developer account; **Device** requires a signed build on physical hardware.
This is the app's first Google Play submission.

## Build and credentials

- **Console:** Create the Play Console app and reserve the package name
  `com.lumen.dailyprayer`; change `app.json` before building if that ID is
  unavailable.
- **Console:** Create/link the EAS project and let EAS generate and retain the
  first Android upload key.
- **Console:** Add `EXPO_TOKEN` to the GitHub `production` environment.
- **Console:** Add `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` as an environment secret
  and `EXPO_PUBLIC_SUPPORT_EMAIL=dehbkoclugu@gmail.com` as an environment variable.
  Only the RevenueCat public `goog_` SDK key belongs in a client build; never add
  a RevenueCat secret key to GitHub or Expo client variables.
- Run the `Android production AAB` workflow. It queues a signed production AAB;
  download it from EAS and upload it to the new app's internal Play track.
- Before 31 August 2026 the upload must target API 35 or newer. From that date,
  new apps and updates must target API 36 or newer. Inspect the uploaded bundle's
  target SDK in Play Console before rollout.

## Billing

- **Console:** Create entitlement `plus` in RevenueCat.
- **Console:** Create Play products `lumen.weekly`, `lumen.annual`, and
  `lumen.lifetime`; attach the intended base plans/offers and import them into
  RevenueCat's current Offering.
- **Console:** Upload RevenueCat's Google service-account credential and allow up
  to 36 hours for validation.
- **Device:** With a Play license tester, verify localized price, eligible offer
  wording, purchase, cancellation/pending handling, restore, app restart, and the
  Play subscription-management link. Production never grants Plus if RevenueCat
  is absent.

## Data Safety draft

This draft describes the repository as of 28 July 2026. Re-check it after any SDK
or RevenueCat integration change.

### Overview answers

- Does the app collect or share required user data? **Yes — collect only.**
- Is collected data encrypted in transit? **Yes.**
- Can users request deletion? **Yes:** device-only content is removed from
  Profile → Delete all data or by uninstalling. **Console:** document the support
  route for deletion of RevenueCat's anonymous purchase record and confirm the
  final Play answer against RevenueCat account settings.
- Account creation: **No account system exists.**

### Data types

- **Financial info → Purchase history:** collected by RevenueCat; not shared
  unless a non-service-provider integration is later enabled; not ephemeral;
  required when purchasing; purposes **App functionality** and **Analytics**.
- **Name:** the optional first name stays only on device; do not declare it as
  collected.
- Journal, prayers, reading progress, bookmarks, highlights, reminder time,
  theme and language stay only on device; do not declare them as collected.
- No location, contacts, messages, photos/video, audio uploads, files/documents,
  calendar, browsing history, crash SDK, advertising SDK or analytics SDK.
- Device identifiers: no advertising identifier integration is configured.
  **Console:** re-check the generated AAB's SDK Data Safety notices; declare this
  if RevenueCat/Play reports an identifier for the final configuration.

RevenueCat's current Android guidance is the controlling reference:
https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety

## App content declarations

- Ads: **No**.
- App access: **All core free screens are accessible without an account.** Explain
  that Plus content opens the Play purchase sheet; provide a license-test path if
  Play review requests paid access.
- Target audience: **13+**, not designed for children. **Console:** choose actual
  intended age bands consistently with the privacy policy.
- Content rating: questionnaire should describe religious/Bible content honestly;
  do not pre-select a rating in this document.
- News, health, government, financial, gambling, dating and user-generated-content
  app declarations: **Not applicable** to the current feature set.
- Ads ID: **No**, subject to final AAB manifest inspection.
- Permissions: notifications are optional and requested only after the user
  chooses a reminder. No location, camera, microphone, contacts or storage access.
- Privacy policy: host `docs/legal/privacy-policy.md` at a public, non-PDF,
  non-geofenced URL and enter it in Play Console.
- Support: publish `dehbkoclugu@gmail.com` and a reachable support URL.

## Store assets

- App icon: current 512×512 Play icon derived from the signed app branding.
- Feature graphic: 1024×500, no device frame or unsupported promotional claim.
- Phone screenshots: at least 360×640 and 390×844; include Today, Bible, Prayer,
  Journal and the honest Plus screen.
- Also capture a large Android/tablet and landscape QA set. Use the signed release
  candidate, both Vigil/Dawn, and 100%/200% font scale.
- Paste the localized copy from `docs/store-listing.md`; prices and introductory
  offers always come from Play, never from hand-written screenshots.

## Test and rollout

- **Console:** If this is a personal developer account created after 13 November
  2023, run a closed test with at least 12 opted-in testers continuously for
  14 days before applying for production access.
- **Device:** Complete onboarding, reminders, all six Scripture editions, purchase,
  restore, offline launch, theme switching and data deletion.
- Review Android vitals/pre-launch report with zero launch crash or ANR.
- Start with internal testing, then closed testing, then production.

## Final release commands

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run release-check
npx expo export --platform android --output-dir dist-android
npm run release-artifact-check -- dist-android
```

Do not submit if any command fails, a store claim differs from the configured
offer, or the Play bundle inspector reports an undeclared SDK/permission.
