# Adaptive and state acceptance matrices

These matrices are release requirements. A failed cell blocks release.

## Real-device visual matrix

| Viewport | Orientation | Themes | Font scale | Critical screens |
| --- | --- | --- | --- | --- |
| 360×640 Android | portrait | Vigil, Dawn | 100%, 200% | Today, Player, Paywall, Quiz, Journal |
| 390×844 iPhone | portrait | Vigil, Dawn | 100%, 200% | Today, Player, Paywall, Quiz, Journal |
| large Android | portrait | Vigil, Dawn | 100%, 200% | Today, Reader, Search, Plan |
| tablet/foldable | expanded | Vigil, Dawn | 100%, 200% | Today, Player, Paywall, Reader |
| phone/tablet | landscape/split | Vigil, Dawn | 100%, 200% | Player, Paywall, Quiz, Journal |

Expanded content is centered at a maximum width and uses safe-area gutters. On
foldables, cards and primary actions stay within one readable column; no full-width
control spans the central hinge. Player/paywall/onboarding/journal must remain
scrollable or keyboard-avoiding at short heights.

## Keyboard / IME

Quiz name and Journal are checked on both phone sizes, landscape and 200% font.
With Gboard and iOS keyboards open, the focused field and primary CTA remain
reachable.

## Empty, loading and error states

| Screen | Empty | Loading | Error/recovery |
| --- | --- | --- | --- |
| Search | prompt/no matches | responsive cooperative search | clear query/filter |
| Library | per-tab illustration and CTA | hydrated local state | corrupt slice resets |
| Plan | designed catalogue | persisted state hydrates | missing plan NotFound |
| Paywall | offer details visible | purchase button busy | retry + restore |
| Notifications | Off state | OS permission request | blocked settings route |
| Purchase | no entitlement | disabled busy CTA | localized error + retry |

## Visual language

- Ionicons outline glyphs are normal; filled glyphs mean selected or complete.
- Scrims use `top`, `center`, or `strong`; elevation uses `standard`, `hero`, or
  `floating`; interactions use common pressed/disabled/focus tokens.
- Navigation uses shared-axis, tab fade-through, and modal container motion.
- Shared verse capture includes the full verse, reference and source credit.
  The card grows and never nests a vertical scroll view.
