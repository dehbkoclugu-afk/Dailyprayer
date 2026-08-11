# Data Controls and Native Reminder Design

## Goal

Finish the two remaining Profile safety controls: an explicit, confirmed local-data wipe and a real platform time picker for daily reminders.

## Chosen Approach

Keep both controls in Profile. A new destructive row opens a native confirmation alert that lists the data removed from this device and states that deleting local data does not cancel a store subscription. Confirmation clears only Lumen-owned persisted user state, cancels local reminders, resets the live Zustand stores, and returns to onboarding. Downloaded first-party language and Scripture packs remain installed because they are application assets, not personal data.

Replace the three preset reminder times with `@react-native-community/datetimepicker`, using Android's native dialog and an inline iOS spinner with explicit cancel/save actions. Persist the selected local time as canonical `HH:mm`; display it using the active locale's 12/24-hour convention. Turning reminders off remains available and cancels both scheduled notification identifiers.

## Alternatives Rejected

- A new Data Controls screen adds navigation and copy without improving the single destructive action.
- Clearing all AsyncStorage would also remove unrelated Expo/library state and downloaded application assets.
- Keeping preset times fails the native-time-picker roadmap requirement.
- English fallback text for destructive confirmation is unacceptable in a 38-language release.

## Data Boundary

Delete these persisted stores and their matching live fields: user/onboarding answers, streak and ritual progress, journal entries, prayer recents/favorites, bookmarks, highlights, reading-plan progress, reader position/preferences, Bible UI state, and player-position keys. Preserve the cached entitlement so a paid user does not temporarily lose access; the store remains its source of truth. Do not modify Scripture files, downloaded content packs, the store purchase itself, or any remote account because Lumen has no user account backend.

## Error Handling

The destructive action runs only after confirmation. If storage deletion fails, remain on Profile and show a localized error; do not claim completion. Notification cancellation is attempted as part of deletion. Reminder permission denial leaves the stored time off and opens system settings, preserving the existing hardened behavior.

## Accessibility and Localization

The destructive row is at least 52 dp, has button semantics, uses danger color, and exposes the localized action label. The iOS picker actions are at least 48 dp. Four new destructive-copy keys must exist in every advertised UI dictionary; locale parity remains a production gate.

## Verification

- Unit-test `HH:mm` parsing, formatting, and invalid fallback behavior.
- Verify all 38 UI dictionaries contain the four new keys.
- Run typecheck, lint, 38-locale production gates, all tests, Android export, and protected-Scripture diff checks.
