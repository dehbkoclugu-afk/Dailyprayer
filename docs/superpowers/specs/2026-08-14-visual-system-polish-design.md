# Visual System Polish Design

**Date:** 2026-08-14  
**Repository:** `dehbkoclugu-afk/Dailyprayer`  
**Branch:** `agent/visual-system-polish`  
**Roadmap scope:** Items 91–98 in `docs/design-100.md`

## Goal

Finish the shared visual-system layer before adding screenshot acceptance tooling. The change removes repeated raw visual values, makes Dawn and Vigil surfaces deliberate, normalizes icons and interaction states, and limits navigation motion to a small documented vocabulary without changing Scripture, purchases, storage schemas, or product behavior.

## Scope

This package completes:

- 91: semantic artwork, scrim, and gold color roles
- 92: theme-specific grain opacity
- 93: Android tonal elevation roles
- 94: consistent outline icons, with filled icons reserved for selected state
- 95: three shared artwork scrim presets
- 96: a quiet active-tab marker plus selected accessibility state
- 97: shared pressed, focused, and disabled visual states
- 98: three motion patterns: shared-axis navigation, fade-through tab content, and container-transform modal surfaces

Items 99 and 100 are intentionally excluded. They will follow in a separate package because share-card text integrity and device screenshot acceptance have different release evidence and review criteria.

## Architecture

### Semantic visual tokens

Existing theme and token modules remain the single source of truth. Add only roles that have multiple real consumers:

- `onArtwork`: primary text/icons placed on imagery
- `onArtworkMuted`: secondary artwork text
- `sacredGold`: brand emphasis and selected accents
- `scrimSoft`, `scrimReadable`, `scrimStrong`: the three artwork overlay presets
- `interactionPressedOpacity`, `interactionDisabledOpacity`: shared interaction state values
- `surfaceElevationHero`, `surfaceElevationCard`, `surfaceElevationFloating`: platform-aware surface roles

No new styling dependency or design-system framework is added. Existing theme hooks and React Native styles consume these values directly.

### Theme grain

The shared screen grain component chooses opacity from the active theme. Vigil keeps the current subtle texture; Dawn uses a lower paper-like opacity so light surfaces do not look dirty. The grain asset and rendering path remain unchanged.

### Elevation

Hero, standard card, and floating surfaces use three shared roles. On Android, elevation decreases with hierarchy rather than defaulting to the same high value. On iOS, existing shadow behavior is preserved through the same role objects where applicable.

### Icons and tabs

Ionicons remain the only icon family. Unselected and ordinary actions use outline names; filled variants are limited to selected navigation state and explicit completion state. The phone tab bar and tablet navigation rail both display the same small active marker and expose `accessibilityState.selected`.

### Artwork scrims

Ritual, plan, Tonight, Bible hero, Verse, and player artwork select one of three presets based on text placement:

- soft: decorative art with no text dependency
- readable: standard title/subtitle overlays
- strong: full-screen or dense artwork text

The presets reuse the contrast guarantee already established by the art contrast tests. No screen may define its own gradient stop opacity for these surfaces.

### Interaction states

Shared helpers provide pressed and disabled opacity; focus remains visible through a semantic focus-ring color and width. Components that already centralize presses adopt the tokens first, followed by remaining direct `Pressable` consumers in the roadmap surfaces. Busy state remains separate from disabled state.

### Motion

Existing animation infrastructure is reused:

- shared-axis for forward/back navigation
- fade-through for tab content changes
- container transform for modal and sheet presentation

Reduce Motion converts each pattern to an immediate state change or static fade. One-off decorative animation is removed only when it duplicates these transitions; functional progress and completion feedback remain.

## Data flow and boundaries

Theme selection flows through the existing theme store and `useTheme`. Components receive resolved semantic values, never theme names. Artwork components receive a scrim preset identifier rather than raw gradient values. Navigation components own selected state and motion choice; business screens do not coordinate transition timing.

No user data, Scripture payload, entitlement, reminder, or application-content pack changes are permitted in this package.

## Failure handling

Unknown scrim or elevation roles must fail at TypeScript compile time. Reduce Motion must always have a static fallback. Unsupported platform focus behavior falls back to the existing visible pressed/selected state without blocking interaction. Visual-token migration must not create runtime configuration or asynchronous loading paths.

## Verification

The package is complete when:

1. TypeScript and ESLint pass.
2. The full existing test suite passes.
3. Android Expo export succeeds.
4. A release contract test rejects new raw artwork colors, ad-hoc scrim opacity, repeated press opacity, and unauthorized filled navigation icons in migrated surfaces.
5. Existing artwork contrast tests remain at or above WCAG AA.
6. Dawn and Vigil smoke coverage confirms their separate grain values.
7. Phone tab and tablet rail expose selected state and render an active marker.
8. Reduce Motion tests confirm static fallbacks for all three motion patterns.
9. `docs/design-100.md` marks 91–98 complete only after the code and checks pass.

## Rollout

This work is delivered as the first PR, based on commit `dca1dcdeb6dc3be3de4a1b9ef99bcdae25e67a25`. The second PR for items 99–100 begins only after this visual-system package is independently validated, so screenshot baselines are captured against the final shared tokens rather than an intermediate design.
