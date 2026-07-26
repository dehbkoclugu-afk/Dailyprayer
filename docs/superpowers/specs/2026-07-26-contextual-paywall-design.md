# Contextual Paywall Design

## Goal

Make the paywall acknowledge the premium feature the user just attempted to
open without changing product claims or religious content.

## Context Model

The paywall accepts a closed `from` value:

- `onboarding`: the personalized daily rhythm was just created.
- `sleep`: the user attempted to open a sleep prayer.
- `prayer`: the user attempted to open a premium guided prayer.
- `plan`: the user attempted to open a premium reading plan.
- `profile` or an unknown/missing value: use the general Plus presentation.

Unknown, repeated, or malformed query values fall back to the general context.

## Presentation Mapping

| Context | Title intent | First visual | Benefit order |
|---|---|---|---|
| General/Profile | Go deeper with Plus | `A8-paywall-hero` | Prayer, plans, sleep, progress |
| Onboarding | Keep the whole new rhythm open | `A13-plan-cover` | Prayer, plans, sleep, progress |
| Sleep | Unlock the night’s sleep prayer | `A10-tonight-night` | Sleep, prayer, progress, plans |
| Prayer | Continue into the guided prayer | `A19-ritual-prayer` | Prayer, sleep, progress, plans |
| Plan | Continue the reading plan | `A13-plan-cover` | Progress, plans, prayer, sleep |

Only the title, the ordering of existing factual benefits, and the hero asset
change. Prices, trials, purchase state, restore behavior, legal copy, and
entitlements remain identical.

## Entry Points

- Today keeps `from=sleep`.
- Onboarding keeps `from=onboarding`.
- Profile keeps `from=profile`.
- Premium guided prayers add `from=prayer`.
- Premium reading plans add `from=plan`.

No content title or Scripture text is passed through the URL.

## Localization

Four contextual title keys are added to all six UI dictionaries. Existing
benefit strings are reordered rather than duplicated or rewritten.

## Accessibility and Failure Handling

- The contextual title remains visible text inside the hero.
- Benefit semantics remain unchanged.
- Long translated titles wrap naturally inside the existing flexible hero.
- Invalid context values resolve to the general paywall; they never produce an
  empty or broken state.

## Verification

- A pure resolver test covers every supported value plus missing, array, and
  unknown values.
- TypeScript, lint, all tests, and Android Expo export pass.
- Every contextual title key occurs in all six locale dictionaries.
- Scripture data and religious text remain unchanged.
