# Split the player's live region: verse text vs. remaining time (roadmap item 49)

Goal: the remaining time should update live but quietly, separately from
the per-line verse announcement — not folded into one loud announcement.

## Task 1: The conflict

**Files:** `app/player.tsx`

The per-line verse `Animated.Text` carried both an explicit
`AccessibilityInfo.announceForAccessibility(prayer.script[line])` call *and*
its own `accessibilityLiveRegion="polite"`. Two problems in one:

- A live region needs its content to change *in place* to fire correctly;
  this element is remounted every line (`key={line}`), which a live region
  is not built for — an unreliable mechanism riding alongside a
  perfectly scoped, explicit one.
- Where it does fire, it risks reading the same line twice: once from the
  explicit announce call, once from the live region reacting to new
  content.

Separately, the remaining-time text in the header had no accessibility
treatment at all — no live region, no explicit label — so it never updated
for a screen-reader user without them navigating back to it manually every
time, and even then it read as `"Guided text prayer · 1 min left"` glued to
whatever punctuation happened to be in the visible string.

## Task 2: One region each, doing one job each

- [x] Removed `accessibilityLiveRegion` from the verse text. The explicit
      `announceForAccessibility` call already reads exactly that text,
      once, and is unaffected.
- [x] Added `accessibilityLiveRegion="polite"` and an explicit
      `accessibilityLabel` (`"Guided text prayer, 1 min left"`, comma
      instead of a visual `·`) to the remaining-time text — "polite" queues
      behind whatever TalkBack/VoiceOver is already saying rather than
      interrupting it, and it now updates on its own, independent of the
      verse announcement.

## Task 3: Guard it

**Files:** `src/a11y/playerLiveRegion.test.ts` (new)

- [x] Checks the remaining-time text's live region and label, that the
      verse text's own `Animated.Text` block carries no
      `accessibilityLiveRegion`, and that the explicit announce call is
      still there.
- [x] **Proved it fails**, three injections, each reverted before the next:
      1. Removed the remaining-time live region/label → caught.
      2. Re-added the conflicting live region to the verse text → caught.
      3. Removed the explicit announce call → caught.

## Task 4: Verify

- [x] `npm test` (178/178), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check, and a real false-positive caught along the way: the
      first version searched for elements by `textContent.includes(...)`,
      which matched the outermost ancestor containing that text (the whole
      page) rather than the specific node — reporting `null`/no live
      region in cases where one clearly existed. Rewritten to query
      `[aria-live]` directly and inspect each match. With that fix: the
      fixed build shows exactly one live region, on the remaining-time
      text (`aria-live="polite"`, label `"Guided text prayer, 1 min
      left"`), and none on the verse text. Rebuilding with both changes
      reverted shows the opposite — the one live region present is on the
      verse text, none on the remaining time — confirming the check is
      meaningful in both directions.

## Left open

- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
