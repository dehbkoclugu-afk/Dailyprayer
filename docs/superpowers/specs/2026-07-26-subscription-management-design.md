# Subscription Management Design

## Goal

Let an active Lumen Plus member open the correct App Store or Google Play
subscription-management page directly from the Profile subscription card.

## Scope

- Show an explicit **Manage subscription** action inside the subscription card
  only when `isPlus` is true.
- Keep the existing paywall action unchanged when `isPlus` is false.
- Reuse `openSubscriptionManagement()` from `src/services/purchases.ts`.
- Add interface copy in the six supported UI locales.
- Show a localized alert if the store page cannot be opened.
- Do not add a dependency, route, or screen.
- Do not modify Scripture data or religious text.

## Interaction

The active Plus card keeps its current title and thank-you copy. A divider
separates that content from a 48 dp minimum-height action row labeled “Manage
subscription,” with an external-link icon. The action row is the only
interactive target in the active state. In the inactive state, the whole card
continues to open the paywall.

## Data Flow

1. Profile reads `isPlus` from `useEntitlementStore`.
2. When active, the management row calls `openSubscriptionManagement()`.
3. The service opens the platform-specific store URL.
4. A rejected open operation produces a localized alert; it does not alter the
   entitlement.

## Accessibility

- The management row uses button semantics and its localized label.
- The target height is at least 48 dp.
- The external-link icon is decorative; the text carries the action meaning.
- The inactive card retains its existing button label and paywall behavior.

## Verification

- TypeScript and lint pass.
- Existing tests pass.
- Android Expo export completes.
- A source-level check confirms all six locale dictionaries contain the new
  labels.
- The design backlog marks item 6 complete only after verification.
