# Bring the reader's "paper" switch closer to Material semantics (roadmap item 46, partial)

Goal: it can stay visually custom, but swipe/tap, checked state, and
large-text layout should meet what a real Material switch guarantees.
Auditing the three named criteria separately, since they turned out to need
three different verdicts.

## Task 1: Checked state — already correct, and browser-unverifiable by design

**Files:** `src/components/ReadingSettingsSheet.tsx` (read, then confirmed
unchanged)

The row already has `accessibilityRole="switch"` and
`accessibilityState={{ checked: paper }}` — the standard, documented RN API
a *native* accessibility bridge reads to tell TalkBack/VoiceOver "switch,
on" or "off". Checked it against the actual react-native-web build to be
sure rather than assume: built a fresh web export, opened the sheet, read
`document.querySelector('[role="switch"]').getAttribute('aria-checked')` —
`null`, both before and after tapping.

That is not this component's bug. Grepped the entire installed
`react-native-web` package (`grep -rn "accessibilityState\." dist/`) — zero
matches anywhere in the library. RNW never reads any sub-property of
`accessibilityState` (checked, busy, selected, expanded — none of them) for
*any* component; the only accessibility-state-shaped thing it wires to a
DOM attribute is the flat `disabled` prop Pressable already takes directly.
This is the same native-works/browser-can't-see-it shape several earlier
items in this pass already ran into from the other direction — the
difference here is native was never broken to begin with, so there's
nothing to add, only to confirm and to leave alone.

## Task 2: Large-text layout — a real bug, fixed

**Files:** `src/components/ReadingSettingsSheet.tsx`

The label's container had no `flex`/`minWidth: 0`. In a flex row, a child
does not shrink below its own intrinsic (unwrapped) text width unless told
to — so at a large system font size the label had nowhere to wrap into and
would grow past the switch instead of wrapping under it, same shape of bug
as several other flex-row label/control pairs in this pass.

- [x] The label's `View` is now `flex: 1, minWidth: 0`; its `Text` gets
      `flexShrink: 1`; the switch track's `View` gets an explicit
      `flexShrink: 0`. In the normal (short-label) case this changes
      nothing visually — `flex: 1` on the label container fills exactly the
      space `justifyContent: 'space-between'` used to distribute, so the
      track still lands flush against the row's right edge.

## Task 3: Swipe gesture — not implemented, and why

Material's own `Switch` also responds to a drag-the-thumb gesture, not just
a tap. This row doesn't, and isn't getting one here: building real
drag-and-snap logic (a `PanResponder`/gesture-handler-based thumb, a
threshold, a release animation) is a genuine interaction feature to add,
not a mechanical fix to an existing one — closer to the kind of scope this
pass has been keeping out of single items (picking new colors, naming new
type roles) than to a bug with one obviously-correct fix. The row's own tap
target is the *entire* card (well past Material's 48dp minimum in both
dimensions), which is already a larger, easier target than a native
switch's thumb-drag requires — tap already reaches every pixel a drag would
have needed to start from. Left open rather than built without a design
review of the gesture itself.

## Task 4: Guard it

**Files:** `src/theme/paperSwitchLayout.test.ts` (new)

- [x] Checks the label container's `flex`/`minWidth`/`flexShrink` values
      and the track's `flexShrink: 0`, and separately checks
      `accessibilityRole`/`accessibilityState` are still declared (so a
      future edit can't silently drop the part that's already correct).
- [x] **Proved it fails**, two injections, each reverted before the next:
      1. Reverted the flex/wrap changes → caught.
      2. Removed `accessibilityState={{ checked: paper }}` → caught.

## Task 5: Verify

- [x] `npm test` (172/172), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 views, unchanged).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check, at a narrow 360px viewport: swapped the label's text
      node for a much longer string (standing in for what a large system
      font size does to the same text) and measured. Fixed build: row grows
      from 54px to 98px tall (wrapped to two lines), the switch track stays
      at `x: 272`, inside the row. Rebuilt with the fix reverted to confirm
      the check is meaningful: row stays flat at 54px (no wrap), the track
      ends up at `x: 686.6` — pushed off the right edge of a 360px-wide
      screen entirely.

## Left open

- The swipe/drag gesture (Task 3), for the reason given there.
- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
