# Theme Artwork Contrast Fix

## Goal

Keep artwork visible in Dawn and Vigil while preserving readable copy, and remove the Today progress-header collision shown in the Android screenshots.

## Design

- Use a light shared scrim plus a directional gradient on ritual cards, concentrated behind their copy.
- Keep the long-form verse safety preset WCAG AA compliant while reducing its opacity to the lowest passing value.
- Render paywall hero copy with artwork foreground colors in both themes and place a bottom gradient behind it.
- Show the `done/total` ratio only inside `ProgressRing`; allow the section title to shrink without overlapping the right-hand content.
- Keep the scope limited to the reported surfaces and introduce no dependencies.

## Validation

Run semantic visual-system tests, all unit tests, TypeScript, and lint before publishing.
