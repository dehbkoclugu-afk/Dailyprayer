# 100 Critical Design Recommendations — Lumen

Deep-dive critique of the current build, synthesized from: Emil Kowalski's design-engineering
principles, taste-skill's anti-slop discipline, impeccable's polish/critique method,
ui-ux-pro-max's UX database, and teardown patterns from Hallow, Glorify, Bible Chat, Calm
and Headspace. Items marked **[ASSET]** need artwork — see `docs/asset-briefs.md`;
items marked **[DONE]** are implemented in code in this branch.

## A. Brand & identity (1–10)

1. **Replace the emoji dove with a real logomark.** An emoji in the hero is the #1 amateur
   tell. **[ASSET A1] [DONE — slot placed]**
2. Define a **glyph system**: one consistent stroke weight (1.75px), rounded caps, gold-on-ink.
   Never mix filled + outline icons in one view (Today header currently does).
3. Craft a **wordmark** ("Lumen" in Fraunces with a subtly raised 'e' ligature or halo dot). **[ASSET A2]**
4. Brand gradient — "**dusk veil**" (deep violet `#2B2352` → midnight `#0E1220`) — must appear
   only on *sacred* surfaces (verse, prayer player, paywall hero). Never on chrome.
5. The gold accent needs a **physical metaphor**: candlelight. All gold elements should glow
   (soft outer shadow `#D9A441` at 20–30%), not sit flat. **[DONE]**
6. Add **grain texture** (2–3% opacity noise) over gradient surfaces to kill the "CSS gradient"
   flatness. **[ASSET A3 — tileable noise PNG]**
7. Give every screen **one moment of art** — an illustration, halo, or texture. Pure-token
   screens (Journal, Profile) currently read as admin panels. **[DONE — slots placed]**
8. App icon: dove-in-halo mark on dusk-veil gradient, gold rim light. No text. **[ASSET A16]**
9. Splash: bg `#0E1220`, centered mark with slow halo bloom (Lottie later). **[ASSET A17]**
10. Voice: every empty state, permission prompt and error must speak in the same gentle,
    second-person liturgical voice. Never system language ("No data").

## B. Color & theming (11–20)

11. **Elevate surfaces by lightness, not shadow alone**: Vigil needs a 3-step surface ramp
    (`#141928` → `#171C2E` → `#1F2740`); shadows barely read on dark. **[DONE]**
12. Add a **candle-glow radial** behind the Today header (gold 8% → transparent, 320px). **[DONE]**
13. Fix goldSoft in Vigil — `#3A3020` reads muddy-olive; shift to `#2E2718` (warmer, darker). **[DONE]**
14. Selected quiz options: add inner glow (gold 12%) not just border color change.
15. Success/danger only in semantics (answered ✦, delete) — never decorative. Audit passed.
16. Dawn bg `#FBF7F0` needs a **paper feel**: faint warm vignette at screen edges via a
    full-screen radial overlay. **[ASSET A3 reuse]**
17. All gradients must be **two-hue, same-temperature**. Never introduce a third hue mid-ramp.
18. Reserve pure `#D9A441` for interactive/reward. Informational gold (labels) drops to 80%
    opacity so CTAs stay the brightest gold on screen.
19. Themed **status-bar & tab-bar tint**: tab bar in Vigil should be `#12172A` (slightly darker
    than surface) with a 1px `#262D45` top hairline. **[DONE]**
20. Plan-card gradients: derive all five from one hue wheel (violet, indigo, teal, umber,
    bronze at same S/L) so the shelf reads as a set. **[DONE]**

## C. Typography (21–30)

21. Verse display should use **Fraunces optical size + slight negative tracking** (-0.5) at
    26pt+; RN: `letterSpacing: -0.3`. **[DONE]**
22. Establish a strict **6-step scale** (13/15/17/22/28/38) — audit found stray 12/14/16/18/20;
    consolidate. **[partially DONE — new UI uses scale]**
23. **Never letter-space serif**; only the sans overline labels get `+2` tracking.
24. Overline labels ("VERSE OF THE DAY") are the brand's voice-of-God device: 11pt, 2.5
    tracking, gold 80%, always uppercase, always Figtree SemiBold. **[DONE]**
25. Body max line length ≈ 38ch on 390px — current 17pt/26 works; never go below 1.5 leading.
26. Numerals: use **tabular numerals** for streak/stats (`fontVariant: ['tabular-nums']`) so
    counters don't jiggle. **[DONE]**
27. Quotes: use real curly quotes and a **hanging quotation mark** on verse cards (the opening
    `“` sits in the margin). **[DONE]**
28. Devotional body: first paragraph gets a **drop cap** (Fraunces, 3-line, gold) — editorial
    signature. **[DONE]**
29. Turkish/i18n readiness: avoid ALL-CAPS on translatable strings except overlines (Turkish
    dotless-i risk); keep copy in a strings module (phase 2).
30. Never center long text; center only display lines ≤2 rows (player, building screen comply).

## D. Layout & spacing (31–40)

31. Adopt a **4pt baseline, 8pt rhythm**; audit stray 6/10px paddings. Section gap = 32,
    card gap = 12, in-card padding = 20. **[DONE]**
32. Screen top padding: greeting should sit 24 below the notch, not 12 — breathing room is the
    sanctuary. **[DONE]**
33. The Today header is cramped: streak + ring compete. Move ring into the **greeting row's
    right edge alone**, put streak into a pill chip under the greeting. **[DONE]**
34. Card radius hierarchy: hero cards 28, standard 24, inner 16, chips pill. Hero verse card
    upgraded to 28. **[DONE]**
35. Add **content max-width (480)** + horizontal auto margins so web/tablet doesn't stretch. **[DONE]**
36. Tab bar: 5 items is max; icons 24px, active state gets a 4px gold dot under label, not just
    tint. **[DONE]**
37. Empty states center in the **upper third**, not dead center (feels lighter). **[DONE — Journal]**
38. Verse card interior: text inset 24, reference row pinned bottom with 20 gap — avoid
    cramped bottom. **[DONE]**
39. Quiz options ≥ 60px tall; icon column fixed 24 so labels align vertically across rows. **[DONE]**
40. Respect safe areas on the player (already using insets) and keep the close button 44pt
    from the top-right corner exactly.

## E. Illustration & imagery — the biggest gap (41–52)

41. **Welcome hero illustration**: full-width, 4:3 — establishes the visual world in second
    one. **[ASSET A4] [DONE — slot]**
42. **Verse-card art series**: 8–12 rotating background paintings keyed to verse themes
    (peace, strength, hope…). Text must stay on a dark scrim area. **[ASSET A5.x] [DONE — slot behind text]**
43. **Quiz affirmation spot art**: small warm vignette (heart/candle) instead of bare icon.
    **[ASSET A6] [DONE — slot]**
44. **Plan-reveal crest**: personalized-plan "seal" illustration above the title. **[ASSET A7] [DONE — slot]**
45. **Paywall hero art**: the single highest-ROI image in the app — sunrise-through-arch scene
    with gold rim light. **[ASSET A8] [DONE — slot]**
46. **Thanks/charity screen**: hands-sharing-light illustration. **[ASSET A9] [DONE — slot]**
47. **Sleep section art**: night-sky/candle motif on the Tonight card. **[ASSET A10] [DONE — slot]**
48. **Prayer category tiles**: 6 spot illustrations (morning, anxiety, gratitude, sleep,
    family, strength) in one style. **[ASSET A11.x]**
49. **Journal empty state**: sprouting-seedling-in-light spot art. **[ASSET A12] [DONE — slot]**
50. **Reading-plan covers**: 5 painterly covers replacing bare gradients. **[ASSET A13.x] [DONE — slot layer]**
51. **Bible tab header art**: subtle open-book-with-light etching behind the title. **[ASSET A14]**
52. **Building screen**: replace sparkles icon with a slow-burning candle spot art. **[ASSET A15] [DONE — slot]**

## F. Motion & micro-interaction (53–65)

53. All entrances: `scale 0.97 + opacity` springs — never from scale(0), never plain fades
    for cards. **[DONE — FadeInDown springs used]**
54. Button press: scale 0.97 at 120ms ease-out (PillButton has 0.98 — tighten to 0.97, 120ms). **[DONE]**
55. Exits must be **faster than entrances** (150ms vs 300ms).
56. **Stagger** ritual cards 60ms apart on Today mount. **[DONE]**
57. Completion moment: ring segment fills with a 300ms sweep + haptic success + one-time
    600ms gold shimmer across the card. Rare = allowed to delight.
58. Streak flame: breathing only when lit (implemented); on tick-up, a single 400ms
    scale-pop 1→1.2→1 with glow bloom.
59. Verse card: slow 8s Ken-Burns drift on the background art (disable under Reduce Motion).
60. Quiz step change: outgoing slides -12px/150ms, incoming +12px/250ms — directional
    continuity, not crossfade.
61. Paywall plan select: selection ring animates via layout spring, price does a 2px rise.
62. Player line change: current implementation fades; add 4px upward drift and blur(2px)→0
    on entry — the "breath" feel.
63. Tab switches: no animation (frequency rule — used hundreds of times).
64. "Amen" on devotional: button morphs to a checkmark for 600ms before navigating back.
65. Never animate width/height/padding — transform+opacity only (audit passed).

## G. Component polish (66–78)

66. PillButton primary needs a **gradient fill** (`#E2B04A→#C99534`) + 1px inner top highlight —
    flat gold reads cheap. **[DONE]**
67. PillButton disabled: 40% opacity is right, but also drop the shadow — disabled things
    don't float. **[DONE]**
68. RitualCard done-state: fill icon container with goldSoft + swap chevron for gold check
    (done) — add a subtle strikethrough-free "completed" caption instead of border-only. **[DONE]**
69. Icon buttons need pressed feedback (opacity 0.6) — share/close currently give none. **[DONE]**
70. ProgressRing: dots are fine at 4 steps; add rounded stroke SVG ring at phase 2; keep
    number tabular. **[DONE — tabular]**
71. Chips: active chip gets goldSoft fill + gold text **+ 1px gold border**; inactive gets
    transparent fill + border only — current surface fill is too heavy. **[DONE]**
72. Inputs: focus state = gold border + goldSoft ring (RN: border + shadow). Currently no
    focus affordance. **[DONE]**
73. Dividers: replace full-bleed hairlines in Profile rows with inset (start at text edge). **[DONE]**
74. Locked content: dim art 40% + centered lock chip "PLUS" — lock icon alone is ambiguous. **[DONE — pray rows]**
75. Toast/feedback layer: add a minimal gold-bordered toast for "Saved", "Streak +1" (phase 2).
76. Skeletons: verse card shimmer placeholder for future API content (phase 2).
77. Share sheet: share a **rendered verse image**, not text (react-native-view-shot, phase 2) —
    organic growth engine.
78. Haptics map: light=navigation, medium=selection, success=completion — audit and enforce
    (selection currently uses light). **[DONE]**

## H. Screen-specific (79–92)

79. **Welcome**: logo mark + hero art + benefit line; move "No account needed" under CTA into
    a trust row with lock glyph. **[DONE]**
80. **Quiz**: show step counter "2 of 6" right-aligned with progress bar. **[DONE]**
81. **Quiz**: name step — add "we use this only to greet you" microcopy (privacy trust). **[DONE]**
82. **Building**: add the four checklist lines appearing with checkmarks as they "complete"
    instead of replacing a single line. **[DONE]**
83. **Reveal**: personalize visibly — echo chosen goal + tradition in card copy ("For your
    anxious season…"). **[DONE — goal echoed]**
84. **Paywall**: add social proof row (laurel + "4.9 ★ · 12k prayers daily") under hero. **[DONE]**
85. **Paywall**: per-plan sub-copy: annual shows "$4.99/mo billed yearly" equivalent price. **[DONE]**
86. **Today**: date line ("Tuesday, July 21") in overline style above greeting. **[DONE]**
87. **Today**: "Tonight" section should visually shift to night — indigo card with moon art,
    not a standard ritual card. **[DONE]**
88. **Bible**: chapter chips scroll horizontally in one row (wrap currently pushes content). **[DONE]**
89. **Bible**: reader typography — 19pt serif, 34 leading, verse numbers superscript gold. **[DONE]**
90. **Pray**: category chips → 2×3 illustrated tile grid (see #48); rows keep play affordance. **[slots ready]**
91. **Journal**: prompt-of-the-day chip above input ("What made you smile today?"). **[DONE]**
92. **Profile**: stats need context — add "day streak / best / total days" captions with icons
    forming one card, not three floating tiles. **[DONE — unified card]**

## I. Conversion & retention design (93–100)

93. Paywall hero must show **content, not adjectives**: mini mockup strip of sleep/prayer
    covers inside the hero art. **[ASSET A8 includes]**
94. Trial reassurance row: "🔔 We'll remind you 2 days before trial ends" — the #1 objection
    killer (Blinkist pattern). **[DONE — bell glyph]**
95. Annual plan card shows **equivalent monthly price** big, yearly total small. **[DONE]**
96. Keep weekly visible but visually quiet — its job is anchoring, not selling. **[DONE]**
97. Post-purchase thanks screen doubles as **first-action push**: single CTA into tonight's
    sleep prayer (immediate value redemption). **[DONE — CTA copy]**
98. Streak-save notification copy references the actual streak number (phase 2: dynamic).
99. Widget (phase 2) is the retention moat — verse + streak on lock screen; design tokens
    already support it.
100. Every locked touchpoint routes to the paywall with **context** (`from=` param) so copy
     can adapt ("Unlock sleep prayers") — plumbing added via router params. **[DONE — from param]**
