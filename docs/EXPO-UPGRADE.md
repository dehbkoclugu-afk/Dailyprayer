# Expo SDK upgrade notes (54 → 55 → 56 → 57)

Current: Expo 57.0.32, React Native 0.86.3, React 19.2.3, TypeScript 6.0,
Reanimated 4.5.1, Worklets 0.10.1.

Verified locally (Windows, Node 22): `expo install --check` clean, `expo-doctor`
21/21, typecheck clean, lint 0 errors (18 warnings), 138/138 tests, release
claims, Android `expo export` and bundle budget (bundle 39.6 MB, assets 12.2 MB).
Not yet verified on a physical device.

## SDK 56 step
- Removed the `@expo/dom-webview: 0.1.5` override (SDK 53 crash pin).
- TypeScript 6 no longer loads ambient `@types/*` by default: added `@types/node`
  and `"types": ["node"]`.
- Tab icon `color` typed as `ColorValue`.
- SDK 56 / RN 0.85 ships a Hermes V1 memory regression; never ship from it.

## SDK 57 step
- `expo install --fix` aligned all modules and registered `expo-sharing` and
  `expo-status-bar` config plugins in `app.json`.
- Hermes regression fixed (expo-doctor no longer reports it).
- First `expo export` after the upgrade can fail with a Babel
  "Config file contains no configuration data" error from a stale Metro cache;
  run once with `--clear`.

## Open
- `eslint-config-expo` React Compiler rules: 18 existing call sites
  (`set-state-in-effect`, `refs`, `immutability`) are warnings in
  `eslint.config.js`; refactor each, verify on device, then restore `error`.
- Device smoke test on Android and iOS (notifications, purchases, journal
  encryption migration, reader scroll, sharing).
- On Windows with `core.autocrlf=true`, `application-content:verify` and
  `privacy:verify` report "stale" due to CRLF only; Linux CI is authoritative.
