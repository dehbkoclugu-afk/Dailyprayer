# Restore Recovery Design

## Goal

Turn a missing purchase restore result into a persistent, actionable recovery
state without inventing support contact information.

## Chosen Approach

Use an inline status card below the restore control. It explains that no active
purchase was found, asks the user to verify the App Store or Google Play
account, and provides a retry button. A support button appears only when
`EXPO_PUBLIC_SUPPORT_EMAIL` is configured at build time.

This is preferable to a transient alert because the instructions and actions
remain visible. Hardcoding an unverified address is rejected, and omitting
support entirely would leave the roadmap requirement incomplete.

## Interaction

- `idle`: show the normal restore action.
- `busy`: disable the restore action and show its progress label.
- `found`: continue to the existing Plus success screen.
- `missing`: keep a status card visible until another restore attempt succeeds
  or the user leaves the paywall.
- The card contains “Try again” and, when configured, “Contact support.”
- A failed mail-app launch shows a localized error alert.

## Configuration

`.env.example` documents:

```text
EXPO_PUBLIC_SUPPORT_EMAIL=support@example.com
```

The example value is descriptive only. Release builds must replace it with a
real monitored address. The app never renders the support action when the
variable is empty.

## Accessibility and Layout

- The card uses alert semantics for its result text.
- Every action has button semantics, a localized label, and a minimum 48 dp
  target.
- Actions wrap vertically, so long German and French labels are not clipped.
- Existing colors, typography, and spacing tokens are reused.

## Error Handling

- Restore network/store errors retain the existing alert and return the state
  to `idle`.
- Mail launch failures show a localized message and do not affect restore state.
- Retry uses the existing `restorePurchase` function and duplicate attempts
  remain blocked while busy.

## Verification

- All six UI dictionaries contain the new account, retry, support, and mail
  error strings.
- TypeScript, lint, and the existing 17 tests pass.
- Android Expo export completes.
- Scripture data and religious text remain unchanged.
- Roadmap item 7 is marked complete only after implementation is verified and a
  real support email can be supplied through the documented build variable.
