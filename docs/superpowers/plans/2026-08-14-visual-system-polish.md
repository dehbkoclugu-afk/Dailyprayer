# Visual System Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Complete roadmap items 91–98 with shared visual tokens, artwork treatments, navigation states, and a three-pattern motion vocabulary.

**Architecture:** Extend the existing src/theme modules instead of adding a dependency or parallel design system. Components consume typed semantic roles; one source-based release contract prevents raw values and unauthorized icon/motion variants from returning.

**Tech Stack:** Expo 53, React Native 0.79, TypeScript 5.8, Expo Router, Ionicons, React Native Reanimated, Node test runner.

## Global Constraints

- Do not change Scripture text, packs, rights metadata, or release claims.
- Do not change purchases, entitlements, reminders, storage keys, or migrations.
- Add no dependency.
- Preserve WCAG AA artwork contrast and Reduce Motion fallbacks.
- Items 99–100 remain outside this plan.
- Work from agent/visual-system-polish, based on dca1dcdeb6dc3be3de4a1b9ef99bcdae25e67a25.

---

## File Structure

- src/theme/tokens.ts: theme colors, interaction, grain, and elevation roles.
- src/theme/artContrast.ts: typed artwork text and scrim presets.
- src/theme/motion.ts: three permitted motion patterns and static fallbacks.
- src/theme/visualSystem.test.ts: token and motion invariants.
- scripts/verify-visual-system-contract.test.mjs: source contract.
- src/components/ArtSlot.tsx: semantic scrim consumer.
- src/components/Screen.tsx: theme-specific grain.
- src/components/PillButton.tsx: shared interaction/elevation.
- src/components/RitualCard.tsx and VerseCard.tsx: artwork migration.
- app/(tabs)/_layout.tsx: icon pairs, marker, tab motion.
- app/_layout.tsx: route motion.
- package.json: test registration.
- docs/design-100.md: completion evidence.

### Task 1: Define semantic visual tokens

**Files:**
- Modify: src/theme/tokens.ts
- Modify: src/theme/artContrast.ts
- Create: src/theme/motion.ts
- Create: src/theme/visualSystem.test.ts
- Modify: package.json

**Interfaces:**
- Produces: interaction.pressedOpacity, interaction.disabledOpacity, interaction.focusRingWidth
- Produces: grainOpacity keyed by ThemeName
- Produces: elevation.hero, elevation.card, elevation.floating
- Produces: ArtworkScrimPreset = soft | readable | strong
- Produces: artworkScrims and resolveMotionPattern(pattern, reduceMotion)

- [ ] **Step 1: Write the failing tests**

Create src/theme/visualSystem.test.ts:

~~~ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { elevation, grainOpacity, interaction, themes } from './tokens.ts';
import { artworkScrims } from './artContrast.ts';
import { resolveMotionPattern } from './motion.ts';

test('Dawn grain is lighter than Vigil grain', () => {
  assert.ok(grainOpacity.dawn < grainOpacity.vigil);
  assert.ok(grainOpacity.dawn >= 0.01);
});

test('surface hierarchy increases monotonically', () => {
  assert.ok(elevation.card.elevation < elevation.hero.elevation);
  assert.ok(elevation.hero.elevation < elevation.floating.elevation);
});

test('semantic roles are complete', () => {
  for (const theme of Object.values(themes)) {
    assert.ok(theme.onArtwork);
    assert.ok(theme.onArtworkMuted);
    assert.ok(theme.sacredGold);
    assert.ok(theme.focusRing);
  }
  assert.deepEqual(Object.keys(artworkScrims), ['soft', 'readable', 'strong']);
  assert.ok(interaction.disabledOpacity < interaction.pressedOpacity);
});

test('Reduce Motion removes transforms', () => {
  assert.equal(resolveMotionPattern('sharedAxis', true).animation, 'none');
  assert.equal(resolveMotionPattern('fadeThrough', true).animation, 'fade');
  assert.equal(resolveMotionPattern('container', true).animation, 'fade');
});
~~~

- [ ] **Step 2: Verify the test fails**

Run: node --experimental-strip-types --test src/theme/visualSystem.test.ts  
Expected: FAIL because the exports do not exist.

- [ ] **Step 3: Add minimal typed roles**

Extend ThemeColors with onArtwork, onArtworkMuted, sacredGold, and focusRing. Preserve current colors by moving existing values into the roles. Export:

~~~ts
export const grainOpacity: Record<ThemeName, number> = { vigil: 0.04, dawn: 0.015 };
export const interaction = {
  pressedOpacity: 0.72,
  disabledOpacity: 0.48,
  focusRingWidth: 2,
} as const;
export const elevation = {
  card: { elevation: 2 },
  hero: { elevation: 5 },
  floating: { elevation: 8 },
} as const;
~~~

In artContrast.ts export the closed preset union and soft/readable/strong scrims. Keep strong alpha at 0.64 for the existing WCAG calculation. Create motion.ts with only sharedAxis, fadeThrough, and container. Reduce Motion returns none for sharedAxis and fade for the other two.

- [ ] **Step 4: Register and run tests**

Append src/theme/visualSystem.test.ts to the npm test command.  
Run: npm test  
Expected: all tests pass.

- [ ] **Step 5: Commit**

~~~bash
git add src/theme/tokens.ts src/theme/artContrast.ts src/theme/motion.ts src/theme/visualSystem.test.ts package.json
git commit -m "Add semantic visual system tokens"
~~~

### Task 2: Centralize artwork, grain, and elevation

**Files:**
- Modify: src/components/ArtSlot.tsx
- Modify: src/components/Screen.tsx
- Modify: src/components/PillButton.tsx
- Modify: src/components/RitualCard.tsx
- Modify: src/components/VerseCard.tsx
- Modify: src/theme/artContrast.test.ts

**Interfaces:**
- Consumes: ArtworkScrimPreset, artworkScrims, grainOpacity, elevation, interaction
- Produces: ArtSlot scrim prop accepting a preset or none

- [ ] **Step 1: Extend the contrast test**

Verify strong retains alpha 0.64 and both artwork text roles meet the existing 4.5:1 worst-case assertion.

- [ ] **Step 2: Verify failure**

Run: node --experimental-strip-types --test src/theme/artContrast.test.ts  
Expected: FAIL until semantic roles are wired.

- [ ] **Step 3: Replace ArtSlot variants**

Replace variant with:

~~~ts
scrim?: ArtworkScrimPreset | 'none';
~~~

Map bare to none, row/card/hero to soft or readable, and contrast to strong. Remove the local OVERLAYS object. Only artworkScrims may supply overlay values.

- [ ] **Step 4: Apply grain and hierarchy**

Make Grain consume useThemeName and grainOpacity. Replace shadow.card and primary-button inline elevation with elevation.card or elevation.hero while preserving shared iOS shadow fields.

- [ ] **Step 5: Migrate the first consumers**

RitualCard and VerseCard use theme onArtwork/onArtworkMuted, scrim="strong", and interaction.pressedOpacity. Do not alter content, layout, or sharing behavior.

- [ ] **Step 6: Verify and commit**

Run: npm run typecheck && npm test && npm run lint

~~~bash
git add src/components/ArtSlot.tsx src/components/Screen.tsx src/components/PillButton.tsx src/components/RitualCard.tsx src/components/VerseCard.tsx src/theme/artContrast.test.ts
git commit -m "Centralize artwork and surface treatments"
~~~

### Task 3: Migrate roadmap surfaces and add the release contract

**Files:**
- Modify: app/(tabs)/today.tsx
- Modify: app/(tabs)/bible.tsx
- Modify: app/(tabs)/pray.tsx
- Modify: app/paywall.tsx
- Modify: app/player.tsx
- Modify: src/components/PlanDayArtwork.tsx
- Modify: src/components/ProgressRing.tsx
- Modify: src/components/ToastHost.tsx
- Create: scripts/verify-visual-system-contract.test.mjs
- Modify: package.json

**Interfaces:**
- Consumes: semantic colors, scrims, elevation, and interaction tokens.
- Produces: a source contract covering every migrated surface.

- [ ] **Step 1: Write the failing source contract**

Read the listed files and reject raw six-digit colors, repeated pressed opacity 0.6/0.7/0.85, direct black scrim rgba values, and legacy ArtSlot variants. Permit color literals only inside src/theme.

~~~js
const forbidden = [
  /#[0-9A-F]{6}/i,
  /opacity:\s*(?:0\.6|0\.7|0\.85)\b/,
  /backgroundColor:\s*['"]rgba\(0,0,0,/,
  /variant=['"](?:row|card|hero|contrast)['"]/,
];
~~~

- [ ] **Step 2: Verify failure**

Run: node --test scripts/verify-visual-system-contract.test.mjs  
Expected: FAIL with current raw values and variants.

- [ ] **Step 3: Perform the smallest migration**

Replace raw artwork colors with theme roles, direct overlays with presets, repeated pressed opacity with interaction.pressedOpacity, and ad-hoc elevation with one of the three elevation roles. Do not refactor business logic.

- [ ] **Step 4: Register, verify, and commit**

Run: npm run typecheck && npm test && npm run lint

~~~bash
git add app src/components scripts/verify-visual-system-contract.test.mjs package.json
git commit -m "Migrate visual states to semantic roles"
~~~

### Task 4: Normalize navigation icons and selected state

**Files:**
- Modify: app/(tabs)/_layout.tsx
- Extend: scripts/verify-visual-system-contract.test.mjs

**Interfaces:**
- Consumes: ThemeColors.sacredGold and interaction roles.
- Produces: one local TabIcon helper with outline/filled pairs.

- [ ] **Step 1: Extend the failing contract**

Assert that every tab consumes focused, pairs outline and filled Ionicons, reserves filled icons for focused state, and renders the same small active marker in bottom and rail layouts.

- [ ] **Step 2: Verify failure**

Run: node --test scripts/verify-visual-system-contract.test.mjs  
Expected: FAIL because current icons ignore focused and render no marker.

- [ ] **Step 3: Add the local helper**

~~~tsx
function TabIcon({ outline, filled, focused, color, size }: {
  outline: keyof typeof Ionicons.glyphMap;
  filled: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Ionicons name={focused ? filled : outline} size={size} color={color} />
      <View style={{ width: focused ? 14 : 0, height: 2, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
}
~~~

Use filled names only for focused tabs. Expo Router continues to provide selected accessibility state.

- [ ] **Step 4: Verify and commit**

Run: npm run typecheck && npm test && npm run lint

~~~bash
git add "app/(tabs)/_layout.tsx" scripts/verify-visual-system-contract.test.mjs
git commit -m "Normalize navigation icon states"
~~~

### Task 5: Apply the three-pattern motion vocabulary

**Files:**
- Modify: app/_layout.tsx
- Modify: app/(tabs)/_layout.tsx
- Extend: src/theme/visualSystem.test.ts
- Extend: scripts/verify-visual-system-contract.test.mjs

**Interfaces:**
- Consumes: resolveMotionPattern(sharedAxis | fadeThrough | container, reduceMotion)
- Produces: one route-to-pattern mapping.

- [ ] **Step 1: Add failing mapping tests**

Assert that card routes use sharedAxis, tabs use fadeThrough, paywall/player modals use container, and no fourth pattern name exists.

- [ ] **Step 2: Verify failure**

Run: npm test  
Expected: FAIL until layout options consume the resolver.

- [ ] **Step 3: Wire native router options**

Call useReducedMotion once per layout and apply only Expo Router-supported animation names. Preserve existing presentation values. Do not add screen-local entrance animations.

- [ ] **Step 4: Verify and commit**

Run: npm run typecheck && npm test && npm run lint

~~~bash
git add app/_layout.tsx "app/(tabs)/_layout.tsx" src/theme/visualSystem.test.ts scripts/verify-visual-system-contract.test.mjs
git commit -m "Standardize navigation motion"
~~~

### Task 6: Close the roadmap and validate release output

**Files:**
- Modify: docs/design-100.md

- [ ] **Step 1: Run full validation**

~~~bash
npm run typecheck
npm test
npm run lint
EXPO_NO_TELEMETRY=1 npx expo export --platform android --output-dir dist
npm run release:verify:bundle -- --root dist --output artifacts/bundle-budget.json
~~~

Expected: every command exits 0 and bundle budgets pass.

- [ ] **Step 2: Update roadmap**

Mark 91–98 complete with exact code evidence. Leave 99–100 open.

- [ ] **Step 3: Final checks**

Run:

~~~bash
npm test
git diff --check
git status -sb
~~~

Expected: tests pass, diff is clean, and only intended files changed.

- [ ] **Step 4: Commit**

~~~bash
git add docs/design-100.md
git commit -m "Complete visual system roadmap items"
~~~

- [ ] **Step 5: Publish**

Push agent/visual-system-polish and open a draft PR targeting main. The PR must list items 91–98, all validation results, Android export result, and state that 99–100 remain open.
