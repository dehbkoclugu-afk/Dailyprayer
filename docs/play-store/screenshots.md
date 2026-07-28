# Google Play screenshot capture kit

Capture these from the signed production candidate on a real Android device.
Do not use mock data that implies unavailable features or offers.

The repository also contains reproducible web-render captures under
`docs/play-store/assets/screenshots/`. They are suitable for copy/layout review;
compare them with the final signed Android build before uploading to Play.
The `Play Store screenshots` workflow generates the same set as the
`play-store-screenshots` Actions artifact for review and download.

## Primary phone sequence

| Order | Screen | State | Caption |
| --- | --- | --- | --- |
| 1 | Today | Verse card and daily rhythm visible | A quiet daily rhythm |
| 2 | Bible | Reader open with source credit visible | Scripture, ready offline |
| 3 | Prayer | Guided prayer library | Prayer for every season |
| 4 | Journal | Gratitude entry composer | Remember what matters |
| 5 | Plus | Store-returned price and offer | Go deeper with Lumen Plus |

## Capture matrix

- Phone portrait: 360×640 and 390×844.
- Tablet/large Android: portrait Today, Bible and Prayer.
- QA only: landscape Player, Plus and Journal.
- Capture Vigil and Dawn themes at 100% font scale.
- QA the same screens at 200% font scale; use the readable 100% captures for
  the listing unless a localized layout requires otherwise.
- Hide notifications, personal journal text, account names and test purchase
  identifiers.
- Prices and introductory offers must come from Google Play at capture time.
- Keep source attribution visible wherever Scripture appears.

## Export

Use lossless PNG or high-quality JPEG, no transparency. Keep the original device
capture; do not add a phone frame, rating, award, Play logo or download badge.
Localized captions may be added later using the approved text in
`docs/store-listing.md`.
