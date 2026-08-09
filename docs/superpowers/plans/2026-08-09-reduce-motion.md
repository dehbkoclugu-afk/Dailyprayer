# Reduce Motion, app-wide (roadmap items 36 + 37)

Goal (36): extend Reduce Motion scope to the whole app — besides player and
flame, onboarding, `RitualCard`, toast and screen-entry animations should
follow the system setting. Goal (37): the shimmer specifically should
disappear under reduced motion, replaced by a static glow/check reward.

## Task 1: Find every animation

`entering=`/`exiting=`/`withRepeat(`/`withTiming(`/`withSpring(` across the
whole app, plus a broad keyword sweep for `FadeIn`/`ZoomIn`/`SlideIn` and
`reanimated` imports to catch anything the narrower search might miss.
Exactly five files: `player.tsx`, `StreakFlame.tsx`, `RitualCard.tsx`,
`ProgressRing.tsx`, `ToastHost.tsx`. A sixth match, a comment in
`onboarding/quiz.tsx` explaining a *deliberate absence* of animation (an old
RN-architecture bug where an exiting layout copy lingered and swallowed taps),
was not one — onboarding has no animation to fix, which is itself the finding
for the item's mention of it.

## Task 2: The premise didn't match the library

Read Reanimated's source before touching anything, because the item's framing
— "besides player and flame, nothing else respects the system setting" —
didn't match what `player.tsx` and `StreakFlame.tsx` were already doing, and
that seemed worth checking rather than assuming.

`getReduceMotionFromConfig` in `animation/util.ts`:

```ts
export function getReduceMotionFromConfig(config?: ReduceMotion) {
  return !config || config === ReduceMotion.System
    ? isReduceMotionOnUI.value
    : config === ReduceMotion.Always;
}
```

`ReduceMotion.System` is the default for `withTiming`, `withSpring`,
`withRepeat`, `withDelay`, and every layout-animation builder
(`BaseAnimationBuilder`'s `reduceMotionV: ReduceMotion = ReduceMotion.System`).
When it resolves true, the animation's `onFrame` returns `true` immediately
and `current` is set straight to `toValue` — zero animated frames, not a fast
version of the same motion.

Verified this is real, not just documentation, with a browser and
`page.emulateMedia({ reducedMotion: 'reduce' })` against `ToastHost`, which had
(at the time) no reduce-motion code of its own:

| | `reduced: false` | `reduced: true` |
| --- | --- | --- |
| Opacity across 5 sampled frames | 0.11 → 0.28 → 0.39 → 0.56 → 0.67 | 1, 1, 1, 1, 1 |
| Transform | translating | `none` |

No file anywhere sets `ReduceMotion.Never`. So all five animated files were
arguably already correct before any code changed.

## Task 3: "Arguably" isn't good enough to leave silent

Two files (`player.tsx`, `StreakFlame.tsx`) already declared their handling
explicitly. The other three (`ProgressRing.tsx`, `ToastHost.tsx`,
`RitualCard.tsx`'s shimmer) relied on the library default with nothing in their
own source saying so — a silent dependency that a future edit, or a future
Reanimated version, could break without anything here noticing.

- [x] `ProgressRing.tsx`: added `useReducedMotion()`, gated the dot's
      `entering={ZoomIn...}` on it.
- [x] `ToastHost.tsx`: same, for `entering={FadeInDown...}` and
      `exiting={FadeOutUp...}`.
- [x] `RitualCard.tsx`: already had `reduceMotion: ReduceMotion.System` set
      explicitly — comment updated to say plainly that this is also the
      library's default, so a reader isn't left wondering why it's written out.
- [x] Re-ran the browser check after the change: identical zero-frame result.
      The point of this task was documentation, not behavior — confirmed it
      didn't accidentally become both.

## Task 4: What item 37 actually needed

The shimmer sweeps `-CARD_W → CARD_W`. Both ends are off the card — the strip
is only 80dp wide with no `left`/`right` set, so `translateX(-360)` sits fully
off-screen left and `translateX(360)` fully off-screen right. Under reduced
motion the value jumps straight to `CARD_W` with no frames in between, so the
shimmer is never visible at all, not a quick flash of it.

The "static glow/check" reward the item asks for was already there,
independent of any animation: `borderColor: done ? t.gold : ...`,
`backgroundColor: done ? t.goldSoft : ...` on the icon badge, and the label
text switching to "Completed · Undo" — all driven directly by the `done`
boolean, rendering identically whether the shimmer plays or not.

## Task 5: Guard it

**Files:** `src/a11y/reduceMotion.test.ts`

- [x] The set of animated files is enumerated explicitly, so a new one added
      later without a story is visible rather than silently uncovered.
- [x] Every animated file must reference `useReducedMotion()`,
      `isReduceMotionEnabled()`, or an explicit `ReduceMotion.System`/`.Always`
      somewhere in its own source.
- [x] `ReduceMotion.Never` anywhere in the app fails outright.
- [x] `ProgressRing` and `ToastHost` are checked by exact source string, not
      just "declares `useReducedMotion`" — a file could import the hook and
      never use it in the ternary, which the previous rule alone wouldn't catch.
- [x] The ritual reward's three static properties are pinned to `done`.
- [x] **Proved it fails:** stripped `ProgressRing`'s declaration entirely,
      added a throwaway animated file with no reduce-motion story, set
      `ReduceMotion.Never` in `RitualCard`, and declared but didn't use
      `useReducedMotion()` in `ToastHost`. Four injections; each was caught (one
      of them by two rules at once, which is fine — `ReduceMotion.Never` is both
      "an opt-out" and, textually, still "a declaration", so rule 2 doesn't
      distinguish it from a real one).

## Task 6: Verify

- [x] `npm test` (149/149), `npm run typecheck`, `npm run lint`, Android export.
- [x] Browser check with `prefers-reduced-motion` emulated both ways, before
      and after the code changes, confirming identical (zero-frame) behavior.

## Left open

- This was verified through Reanimated's web shim, not a real iOS/Android
  device. The shim aims for parity with the native implementation and the
  source logic (`animation.onFrame = () => true` on the very first frame) gives
  no obvious room for a platform-specific difference, but a device pass with
  Reduce Motion on is still worth a line in the go-live checklist.
- If a sixth animated file is ever added without reading this test's failure
  message, the guard will say so — but it won't tell that person which of the
  three acceptable declarations to reach for. Worth a one-line contributor note
  if this file list ever needs to grow past the current five.
