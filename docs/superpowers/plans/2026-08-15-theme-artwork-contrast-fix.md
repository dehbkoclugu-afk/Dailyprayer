# Theme Artwork Contrast Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix excessive card darkness, Dawn paywall contrast, and Today progress overlap.

**Architecture:** Retain the semantic scrim API and layer existing Expo gradients only where copy needs local contrast. Keep progress ownership inside `ProgressRing` and make `SectionHeader` resilient to narrow widths.

**Tech Stack:** React Native, Expo Router, TypeScript, Expo Linear Gradient

## Global Constraints

- No new dependencies.
- Preserve readable artwork foreground colors in both themes.
- Keep the strong scrim at WCAG AA contrast.

---

### Task 1: Artwork contrast

**Files:** `src/theme/artContrast.ts`, `src/components/RitualCard.tsx`, `app/paywall.tsx`, `app/(tabs)/today.tsx`

- [x] Lower the strong scrim to the minimum verified AA-safe opacity.
- [x] Add directional gradients behind ritual, paywall, and sleep-card copy.
- [x] Use artwork foreground colors for the paywall hero in both themes.

### Task 2: Narrow-screen progress header

**Files:** `src/components/SectionHeader.tsx`, `app/(tabs)/today.tsx`

- [x] Make the title shrink safely and keep right content contained.
- [x] Remove the duplicate ratio outside `ProgressRing`.

### Task 3: Verification and publication

**Files:** `src/theme/artContrast.test.ts`

- [ ] Run tests, typecheck, and lint.
- [ ] Commit the scoped diff, push the feature branch, and open a draft PR.
