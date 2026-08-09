# Default the player's auto-advance to paused under a screen reader (roadmap item 48)

Goal: the screen must not move to the next line before the user has
finished it — resuming has to be an explicit choice, not a timer.

## Task 1: The bug

**Files:** `app/player.tsx` (read)

`paused` defaulted to `false` unconditionally. The auto-advance timer
(`Math.max(4000, line.length * PACE_FACTOR[pace])`) is tuned to a sighted
reading pace; TalkBack/VoiceOver's own reading speed has nothing to do with
it, and a screen-reader user could easily still be partway through the
current line when the screen changed under them.

## Task 2: Detect it, once and live

**Files:** `app/player.tsx`

- [x] A new effect checks `AccessibilityInfo.isScreenReaderEnabled()` on
      mount and calls `setPaused(true)` if it resolves `true` — mirroring
      the `cancelled`-flag pattern `StreakFlame.tsx` already uses for its
      own `isReduceMotionEnabled()` check.
- [x] Also subscribes to `screenReaderChanged`, so turning a screen reader
      on *while already in the player* pauses it too, not just at mount.
- [x] Deliberately one-directional: the handler only ever calls
      `setPaused(true)`, never `setPaused(false)`. Turning the screen
      reader back off must not silently restart auto-advance out from
      under someone who paused the same way any other listener would.
- [x] No new race to worry about: the existing auto-advance effect already
      depends on `paused` and clears its own timer on every dependency
      change, so even in the brief window before the async check resolves,
      the very next `paused` update (if any) cancels an already-started
      timer before it can fire — and the minimum timer is 4000ms regardless,
      far longer than a native `isScreenReaderEnabled()` call takes to
      resolve.

## Task 3: Guard it

**Files:** `src/a11y/playerAutoAdvance.test.ts` (new)

- [x] Checks the detection effect exists (both the initial check and the
      live listener), that neither branch ever calls `setPaused(false)`,
      and that the auto-advance timer still gates on `paused` (so the
      detection above has something to actually stop).
- [x] **Proved it fails**, four injections, each reverted before the next:
      1. Removed the whole detection effect → caught (two tests at once).
      2. Made the live-toggle handler call `setPaused(enabled)` instead of
         only pausing → caught by the exact-pattern check.
      3. Added an explicit `setPaused(false)` branch on the initial check
         → caught by the literal-string check specifically (proving that
         assertion catches a variable-free auto-resume, not just the one
         the previous injection used).
      4. Made the auto-advance timer ignore `paused` entirely → caught.

## Task 4: Verify

- [x] `npm test` (175/175), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check, and a useful fact about the harness: react-native-web's
      `isScreenReaderEnabled()` is hardcoded to always resolve `true` (there
      is no reliable way to detect a real screen reader from a web page),
      so *every* browser build of this player starts paused once the fix
      is in — which turned out to make the check simple rather than
      awkward. Opened `/player?id=morning-light`: fixed build shows
      "Resume" (not "Pause") immediately on mount, and the first line is
      still on screen after an 8-second wait — well past the ~7.2s the
      first line's own timer would need at normal pace. Rebuilt with the
      fix removed to confirm the check is meaningful: shows "Pause" on
      mount (already playing) and the line is gone by the 8-second mark,
      exactly the bug this item describes.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
