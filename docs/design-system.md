# Design System — "Sanctum" visual language

The app must feel like a **candle-lit sanctuary**, not a SaaS dashboard: warm, quiet,
reverent, premium. We deviate deliberately from the generic lavender-wellness look —
the category leaders (Hallow, Glorify) win with deep calm darks + warm light accents.

## Brand

- **Product name:** *Lumen — Daily Prayer & Bible*
- **Personality:** reverent, warm, unhurried, hopeful. Never gamified-loud, never corporate.
- **Voice:** second person, gentle imperative ("Take a breath. God is near.").

## Color tokens

Dual-theme. Dark ("Vigil") is the hero theme — prayer happens at morning and night.

| Token | Vigil (dark) | Dawn (light) | Use |
|-------|--------------|--------------|-----|
| `bg` | `#0E1220` deep midnight | `#FBF7F0` warm parchment | screen background |
| `surface` | `#171C2E` | `#FFFFFF` | cards |
| `surfaceAlt` | `#1F2740` | `#F3EDE2` | nested/secondary cards |
| `ink` | `#F2EEE6` warm ivory | `#221E19` warm near-black | primary text |
| `inkSoft` | `#A9A698` | `#6E675C` | secondary text |
| `inkFaint` | `#6C6B63` | `#9C948A` | tertiary/captions |
| `gold` | `#D9A441` | `#B8860B` | accent: streaks, CTAs, halo |
| `goldSoft` | `#3A3020` | `#F5E7C8` | accent surfaces |
| `blue` | `#7C9CD9` | `#4A6BAA` | links, secondary accent |
| `success` | `#7FB58A` | `#3E7C4F` | completion |
| `danger` | `#D97B6C` | `#B0492F` | destructive |
| `border` | `#262D45` | `#E7DFD0` | hairlines |

Rules: gold is *earned* — CTAs, streak flame, completed rings, verse highlights only.
Body text contrast ≥ 4.5:1 in both themes. No pure black/white anywhere.

## Typography

- **Display / scripture:** `Fraunces` (optical serif, warm, editorial). Verses are set
  36–40pt, tight leading, with generous margins — scripture is the hero artwork.
- **UI:** `Figtree` (humanist sans, friendly, not Inter-generic).
- Scale (pt): 40 display · 28 title · 22 heading · 17 body · 15 secondary · 13 caption.
- Line-height 1.5 for body; 1.15 for display serif.

## Shape, depth, texture

- Radius: 24 cards · 16 inner elements · 999 pills/buttons.
- Depth: soft single shadow (y=8, blur=24, 25% opacity) on dark; hairline border + faint
  shadow on light. No neumorphism embossing (fails contrast).
- Texture: subtle radial "halo" gradients behind hero cards (gold at 6–10% opacity),
  linear-gradient dusk imagery on verse cards. Grain/vignette on verse share images.

## Motion (Emil Kowalski principles)

- Durations 150–300ms; spring for entrance (damping 18–22), timing for exits (exits faster).
- The streak flame *breathes* (scale 1→1.06, 2s loop) — the only ambient motion.
- Card completion: checkmark draw-in + gold ring sweep (300ms), haptic `light`.
- Screen transitions: native stack defaults; paywall = modal slide with dimmed backdrop.
- Respect `Reduce Motion`: disable ambient loops, keep opacity fades.

## Core components

- `VerseCard` — full-bleed gradient imagery, serif verse, reference chip, share + save.
- `RitualCard` — today-stack item: icon, title, duration, state (locked/next/done ring).
- `StreakFlame` — flame glyph + count; breathing animation; gold when lit today.
- `ProgressRing` — daily completion ring (Hallow-style) on Today header.
- `PillButton` — primary (gold fill, ink text), secondary (surfaceAlt), ghost.
- `PlanRow`, `PrayerTile`, `ChapterSheet`, `PaywallOption`, `QuizOption`.

## Screen inventory

1. **Onboarding** — welcome → 9-step quiz → building-plan interstitial → plan reveal → paywall.
2. **Today (Home)** — greeting + streak + ring; ritual card stack; "Tonight" sleep section.
3. **Bible** — reader (public-domain WEB/KJV), book/chapter sheet, verse actions
   (highlight, save, share-as-image), plans tab.
4. **Pray** — guided prayer library by need (anxiety, gratitude, sleep, family…),
   audio player, sleep section, AI "write my prayer" entry.
5. **Journal** — gratitude entries, prayer requests with answered/♥ states.
6. **Profile** — stats (streak, minutes, completed), reminders, theme, subscription, settings.
7. **Paywall** (modal) — reachable from onboarding, locked content, profile.

## Accessibility checklist

- Touch targets ≥ 44×44; labels on all icon buttons; DynamicType-friendly (rem-like scale);
- contrast verified per token table; reduced-motion honored; no emoji-as-icon (use Ionicons).
