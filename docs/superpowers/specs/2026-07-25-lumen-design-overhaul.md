# Selaora Design Overhaul

Date: 2026-07-25
Status: Approved direction; implementation pending written-spec review
Target: Expo/React Native application in `dehbkoclugu-afk/Dailyprayer`

## Objective

Implement the complete 100-item Selaora design critique without weakening the
existing Sanctum identity. The work must improve trust, task clarity,
accessibility, localization, recoverability, responsive behavior, and runtime
performance while preserving the core midnight-indigo, candle-gold,
Fraunces/Figtree, painterly devotional world.

## Product Principles

1. Prayer comes before monetization.
2. Gold represents sacred light and primary action, not every positive state.
3. Today presents one clear next ritual rather than a catalogue of tasks.
4. Personalization must be real, visible, and explainable.
5. Destructive actions are confirmed and recoverable.
6. All user-facing and assistive copy follows the selected locale.
7. Reduced Motion, large text, TalkBack, keyboard insets, and 48dp Android touch
   targets are release requirements.
8. Existing helpers, tokens, components, and installed dependencies are reused
   before new abstractions or packages are introduced.

## Delivery Packages

### Package 1 — Trust and Safety

- Remove the intercepted paywall close/discount flow.
- Let users complete a real prayer before the first paywall.
- Remove unverifiable social proof.
- Replace misleading plan-building language with honest preference setup unless
  the generated plan is genuinely personalized.
- Move notification permission behind an explicit contextual action.
- Add confirmation and undo for journal deletion.
- Add a guarded journey-reset flow that explains deleted data.
- Add localized purchase, restore, notification, and sharing recovery states.

Acceptance:

- Closing paywall always closes it immediately.
- Journal deletion can be undone.
- Reset cannot happen in a single accidental tap.
- No unverified marketing claims remain.
- Every failed high-value action has a visible recovery path.

### Package 2 — Today and Completion

- Make the next ritual the only dominant action.
- Collapse completed rituals into a quiet summary.
- De-emphasize rituals that are not yet timely.
- Add explicit next-action copy to progress.
- Add a bespoke 4/4 completion state with blessing, closing artwork, and an
  optional journal prompt.
- Allow accidental completion to be reversed.
- Order rituals using onboarding preferences where available.

Acceptance:

- A first-time user can identify the next action without reading every card.
- The 4/4 state is visually and emotionally distinct.
- Completed and upcoming states do not compete with the next action.

### Package 3 — Honest Onboarding and Monetization

- Make preference effects visible with “because you chose…” explanations.
- Show concrete premium content rather than adjective-only benefits.
- Clarify trial dates, billing totals, equivalent monthly pricing, and restore
  status.
- Give active subscribers a functional subscription-management route.
- Preserve premium context with the existing `from` parameter.
- Remove moral pressure from purchase copy.

Acceptance:

- Pricing, renewal, trial, and total charge are unambiguous.
- Purchase and restore expose loading, success, failure, and retry states.
- Personalization statements correspond to actual behavior.

### Package 4 — Prayer Player

- Label the experience as guided text prayer until narration exists.
- Replace long dot sequences with semantic progress and remaining time.
- Disable Previous at the first line.
- Add pacing controls using the existing timing model.
- Persist and resume player position.
- Announce line changes accessibly.
- Respect Reduced Motion in every transition.
- Create a quiet, branded Amen/completion moment.

Acceptance:

- The player never implies audio playback when no audio is present.
- State survives navigation away and back.
- TalkBack and Reduced Motion users receive equivalent functionality.

### Package 5 — Bible and Plans

- Add Book → Chapter selection, search, previous/next chapter, and Continue
  Reading.
- Move highlighting from whole-verse tap to an explicit action or long press.
- Add highlight, copy, share, and save actions.
- Add a saved/highlighted verses destination.
- Make every plan card actionable with preview, start, resume, progress, and
  completion states.
- Preview locked plan structure before opening the paywall.
- Replace unbounded chapter rendering with a virtualized reader.

Acceptance:

- No visible plan or reader control is a no-op.
- Users can resume both scripture and plans.
- Scrolling cannot accidentally mutate highlight state.

### Package 6 — Prayer Discovery

- Lead with recommended/recent content.
- Reduce the six-category first-viewport wall.
- Use compact filters or editorial tiles and expose filter reset clearly.
- Add favorites and recent prayers.
- Preserve the existing illustrated category family.

Acceptance:

- The first prayer is reachable without scanning all categories.
- Active filters are obvious and removable.

### Package 7 — Accessibility, Localization, and Input

- Replace interactive Text elements with semantic Pressables.
- Enforce 48dp Android targets for all actions.
- Add live announcements for toast, save, highlight, purchase, and restore.
- Localize accessibility labels, dates, alerts, errors, player strings, prayer
  data, notification copy, and onboarding copy.
- Add selected/disabled/busy accessibility state.
- Raise low-contrast essential metadata from `inkFaint`.
- Support large text reflow and remove unsafe fixed-height text surfaces.
- Add keyboard/IME avoidance to onboarding and Journal.

Acceptance:

- Core onboarding, Today, prayer, Bible, Journal, and paywall flows are usable
  with TalkBack and the largest supported text size.
- Switching to Turkish does not leave English core-flow or assistive copy.
- No required action has a target smaller than 48dp.

### Package 8 — Adaptivity and Performance

- Virtualize Journal entries.
- Compress and resize oversized raster assets to their rendered use cases.
- Lazy-load noncritical art.
- Bound verse-share rendering resolution, quality, concurrency, and feedback.
- Cancel infinite animations on unmount.
- Centralize Reduced Motion behavior.
- Improve expanded-width behavior without prematurely building a separate
  tablet product; keep the current phone composition until a real tablet layout
  is defined.
- Reconsider portrait lock only after expanded-width behavior is verified.

Acceptance:

- Category thumbnails are not decoded from multi-megabyte source images.
- Long Journal and Bible datasets remain responsive.
- Sharing cannot be started twice and visibly reports progress.
- No decorative infinite animation survives unmount.

### Package 9 — Visual System and Brand Behavior

- Reserve gold for sacred light, primary action, and premium identity.
- Use semantic success treatment for completed rituals.
- Reduce repeated rounded-card grammar with open typography, dividers,
  manuscript surfaces, and selective full-bleed art.
- Wire the missing building-candle artwork.
- Verify every artwork scrim in Vigil and Dawn.
- Remove or intentionally use orphaned art assets.
- Turn “light” into an interaction model, particularly Today progression and
  completion.
- Reframe streaks as return/rhythm, with hide and grace-day controls.

Acceptance:

- Selection, completion, premium, lock, and primary-action states are visually
  distinguishable without relying on gold alone.
- No production surface renders an art placeholder.
- Selaora remains recognizable in interaction even when artwork is removed.

## Implementation Order

1. Trust/safety and destructive-action recovery.
2. Localization, accessibility foundations, and Reduced Motion.
3. Today hierarchy and completion.
4. Onboarding, paywall, purchase, and restore.
5. Prayer player.
6. Bible reader and plans.
7. Prayer discovery and saved content.
8. Asset pipeline and list performance.
9. Expanded-width behavior and final visual-system pass.

Each package is implemented and validated independently. Changes should be
small enough to review and revert without destabilizing unrelated flows.

## Validation

- TypeScript typecheck and existing automated tests.
- Static search for hard-coded user-facing English and interactive Text.
- Android production build.
- Manual checks in Vigil and Dawn themes.
- Manual checks in English and Turkish.
- TalkBack pass through onboarding, Today, player, Bible, Journal, and paywall.
- Largest-font-scale pass.
- Reduced Motion pass.
- Purchase/restore failure and cancellation simulation.
- Long Journal and full-chapter performance checks.
- Asset dimension and compressed-size budget check.

## Explicit Non-Goals

- Actual narrated audio production.
- A fully separate tablet information architecture before usage evidence.
- A new backend or content-management platform.
- Fabricated ratings, usage numbers, testimonials, or charity claims.
- New dependencies where React Native, Expo, or an installed package already
  provides the required behavior.

## Completion Definition

The overhaul is complete when all 100 critique items are either implemented or
documented as intentionally superseded by a stronger solution in this
specification, all acceptance criteria pass, the Android build succeeds, and
no P0/P1 design finding remains open.
