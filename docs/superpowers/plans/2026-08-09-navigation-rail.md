# Turn the tablet bottom bar into a real navigation rail (roadmap item 51)

Goal: above 840dp, use Material's expanded-width navigation pattern
instead of a wider bottom bar.

## Task 1: What was there

**Files:** `app/(tabs)/_layout.tsx` (read)

Above 840dp, the tab bar stayed at the bottom of the screen — just
centered to a fixed 600px width with rounded top corners. Still a bottom
bar, just a stretched phone pattern, not Material's own navigation-rail
guidance for this breakpoint.

## Task 2: `@react-navigation/bottom-tabs` already has this built in

Checked the installed version (`7.18.13`) before building anything custom:
`BottomTabView`/`BottomTabBar` support first-party `tabBarPosition`
(`'bottom' | 'top' | 'left' | 'right'`) and `tabBarVariant`
(`'uikit' | 'material'`) options. Setting `tabBarPosition: 'left'` switches
the *screen's own* container to a row layout (content beside the bar, not
underneath it) — not something this app needed to build; the `'material'`
variant is documented as being specifically for the left/right position.

- [x] `app/(tabs)/_layout.tsx`: `tabBarPosition: expanded ? 'left' :
      'bottom'`, `tabBarVariant: expanded ? 'material' : 'uikit'`.
- [x] Removed the old fixed-`600`-width/centered/rounded-corner styling —
      that was the previous, incomplete answer to this exact breakpoint;
      keeping it alongside the real fix would have been two competing
      answers to the same question.
- [x] `borderRightColor` added next to the existing `borderTopColor` — the
      rail's edge is now on the right (between it and the content), not
      the top.

This is scoped to *only* the nav pattern per the item's own wording — item
52 (two-column content) is the next item, not folded in here.

## Task 3: Guard it

**Files:** `src/theme/navigationRail.test.ts` (new)

- [x] Checks the `expanded` breakpoint still gates `tabBarPosition`/
      `tabBarVariant`, and that the old centered-bottom-bar styling is
      gone (its presence would mean the item was patched over, not fixed).
- [x] **Proved it fails**: reverted to the exact previous code (dropped
      the two new options, restored the old width/centering/radius
      styling) — both assertions caught it. Restored.

## Task 4: Verify

- [x] `npm test` (180/180), `npm run typecheck`, `npm run lint`,
      `npm run release-check`, `npm run tap-targets` (13 phone-width views,
      unchanged).
- [x] Android `expo export --platform android` — clean.
- [x] Browser check, two viewports:
      - **900px (≥840dp):** all five `role="tab"` elements stack
        vertically at `x: 12` (a rail on the left), each `54px` tall — well
        past the 48dp minimum. A screenshot confirms it visually: a real
        Material rail, active item pilled in gold, content occupying the
        full remaining width to the right rather than a narrow centered
        column.
      - **400px (<840dp):** unchanged — all five tabs sit in a horizontal
        row at the bottom (`y: 725`, same `y` for all five).
      Rebuilding with the fix reverted and re-running the same check
      confirmed both assertions fail against the old code, then restored
      and re-confirmed passing.

## Left open

- Item 52 (two-column content layout for tablet) is a separate item, not
  addressed here.
- The Dawn-theme `t.gold`-on-`t.goldSoft` contrast failure (item 32) and the
  `useStreakStore`/`tickToday()` Zustand hydration race (item 38) remain
  unresolved and out of this item's scope.
