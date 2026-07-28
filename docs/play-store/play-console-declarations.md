# Google Play Console declarations

Drafted from the repository on 2026-07-28. Confirm answers against the uploaded
AAB and the actual RevenueCat configuration before submission.

## App identity

- App name: **Lumen: Daily Prayer & Bible**
- Package: **`com.lumen.dailyprayer`**
- Category: **Lifestyle**
- Contains ads: **No**
- Account required: **No**
- Paid features: **Yes — Google Play Billing through RevenueCat**

## Data Safety

- Data collected: **Yes**
- Data shared: **No**, assuming RevenueCat is declared as a service provider and
  no non-service-provider integrations are enabled.
- Financial info → Purchase history:
  - collected by RevenueCat;
  - required only when a purchase is made;
  - not ephemeral;
  - purposes: App functionality and Analytics;
  - encrypted in transit.
- Name, journal, prayers, streaks, reading progress, bookmarks, highlights,
  reminders, theme and language remain on-device and are not collected.
- No location, contacts, messages, photos/video, audio uploads, files, calendar,
  browsing history, advertising or third-party analytics SDK.
- Deletion: local data can be deleted in Profile or by uninstalling. Confirm and
  document the support path for deletion of RevenueCat's anonymous purchase
  record.

## App content

- Target audience: **13+; not designed for children.**
- App access: core content is available without an account. Plus content opens
  Google Play purchase UI; provide reviewer instructions/license-test access if
  requested.
- Content rating: disclose religious/Bible content; answer the questionnaire
  factually rather than preselecting a rating.
- News, health, government, finance, gambling, dating and user-generated content:
  **Not applicable.**
- Ads ID: **No**, subject to final AAB manifest inspection.
- Permissions: optional notifications only. Confirm the final bundle declares no
  location, camera, microphone, contacts or broad storage permission.

## URLs and contact

- Privacy: use the deployed `privacy.html` GitHub Pages URL.
- Terms: use the deployed `terms.html` GitHub Pages URL.
- Support: use the deployed `support.html` URL.
- Support email: **dehbkoclugu@gmail.com**

## Billing and testing

- Products: `lumen.weekly`, `lumen.annual`, `lumen.lifetime`.
- RevenueCat entitlement: `plus`.
- Store-returned prices and eligibility determine all offer wording.
- Verify purchase, pending/cancelled transaction, restore, restart and subscription
  management with a Play license tester.
- For a qualifying new personal developer account, complete the required closed
  test before applying for production access.

## Final AAB inspection

Confirm target SDK ≥35 for submissions before 2026-08-31, signing certificate,
version code, permissions, native 16 KB page-size compatibility, SDK Data Safety
notices, pre-launch report and Android vitals.
