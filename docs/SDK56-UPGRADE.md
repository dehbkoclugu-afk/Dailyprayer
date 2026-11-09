# Expo SDK 56 checkpoint

Verified locally (Windows, Node 22): `expo install --check` clean, typecheck clean,
lint 0 errors, 138/138 tests, release claims, Android `expo export` and bundle budget.

## Changes
- Expo 56.0.24, React Native 0.85.3, React 19.2.3, TypeScript 6.0.
- Removed the `@expo/dom-webview: 0.1.5` override (SDK 53 crash pin); SDK 56 requires `~56.0.6`.
- TypeScript 6 no longer loads ambient `@types/*` by default: added `@types/node` and `"types": ["node"]`.
- Tab icon `color` typed as `ColorValue` (React Navigation 8 typing).

## Open
- `eslint-config-expo@56` adds React Compiler rules. 18 existing call sites
  (`set-state-in-effect`, `refs`, `immutability`) are downgraded to warnings in
  `eslint.config.js`; refactor each and verify on device, then restore `error`.
- `expo-doctor` flags the Hermes V1 memory regression in SDK 56 / RN 0.85
  (fixed in Hermes 250829098.0.16, shipped with SDK 57 / expo >= 57.0.9).
  Do not ship a production build from this checkpoint; upgrade to SDK 57 first.
- On Windows with `core.autocrlf=true`, `application-content:verify` and
  `privacy:verify` report "stale" due to CRLF only; Linux CI is authoritative.
