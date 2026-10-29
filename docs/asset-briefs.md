# Selaora Art Direction & Asset Generation Briefs

Hand this document to your image-generation AI (Midjourney, DALL·E, Imagen, Firefly…)
**one asset at a time**. Always paste the MASTER STYLE PROMPT first, then the asset's
own prompt. Deliver files with the exact filenames below into `src/assets/art/`,
then register them in `src/assets/registry.ts` (one-line change per asset — instructions
are in that file). Every slot in the app is already laid out and waiting.

---

## MASTER STYLE PROMPT (paste before every asset prompt)

> **Style: "Sanctum" — sacred contemporary editorial illustration.** Painterly digital
> gouache with soft brush grain and subtle paper texture; NOT flat vector, NOT 3D render,
> NOT photograph. Color world: deep midnight indigo `#0E1220`, twilight violet `#2B2352`,
> warm ivory `#F2EEE6`, candle gold `#D9A441` used as the single light source in every
> scene — light always feels like candlelight or first dawn. Values kept dark-to-mid so
> ivory text remains legible on top. Soft atmospheric depth, gentle film grain (2–3%),
> subtle vignette. Mood: reverent, quiet, hopeful, warm; evokes stained glass, illuminated
> manuscripts and Fra Angelico light — but minimal and modern, with large areas of calm
> negative space. Human figures (when present) are faceless/simplified, seen from behind
> or in silhouette, never photorealistic, always dignified. No text, no letters, no
> watermark, no logos inside the artwork.
>
> **Negative prompt:** text, watermark, signature, photorealism, 3D render, plastic
> sheen, neon colors, purple-pink AI gradient, lens flare, harsh saturation, cluttered
> composition, cartoon outlines, anime, emoji style, stock-photo look, extra limbs,
> distorted anatomy, kitsch religious poster.

**Consistency controls (use if the tool supports them):**
- Midjourney: append `--ar <given> --style raw --stylize 250 --chaos 5`; generate all
  assets in one session, reuse the first accepted image as `--sref` for the rest.
- DALL·E/Imagen: keep the master prompt verbatim; regenerate until the palette matches
  the four hexes; ask for "same illustration style as previous" within one chat.
- Always upscale to at least the pixel size given, export PNG (transparent where noted).

---

## A1 — Logomark · `A1-logomark.png` · 512×512 · transparent PNG
**Placement:** welcome header (44px), later app-wide.
> Minimal sacred logomark: a rising dove formed by three overlapping candle-flame shapes,
> drawn in a single continuous elegant line, warm gold `#D9A441` on transparent
> background, subtle inner gradient from `#E2B04A` to `#C99534`, faint outer glow.
> Geometry balanced inside a circle, readable at 24 px. Flat emblem, no scene, no
> background. --ar 1:1

## A2 — Wordmark (optional) · `A2-wordmark.png` · 1200×400 · transparent
> The word "Selaora" — provide as vector/SVG from your design tool instead of AI if
> possible; if AI-generated, serif close to Fraunces, ivory `#F2EEE6`, a small gold halo
> dot above the "e". --ar 3:1

## A3 — Grain/noise tile · `A3-grain.png` · 512×512 · transparent
> Neutral monochrome film-grain noise tile, uniform, tileable, 50% gray on transparent,
> fine 35mm grain. (Any texture generator works; AI optional.)

## A4 — Welcome hero · `A4-welcome-hero.png` · 1170×1000 (ratio 1.17:1)
**Placement:** onboarding welcome, 280pt tall, rounded 28.
> Wide hero scene: a small human figure seen from behind, kneeling or standing on a calm
> hillside at first light, vast midnight-indigo sky `#0E1220` occupying the upper two
> thirds with tiny gold stars, a soft dawn of candle gold `#D9A441` breaking at the
> horizon and gently lighting the figure's shoulders. Large tranquil negative space in
> the sky. Painterly gouache, soft grain. Composition anchored bottom-center so the top
> stays quiet. --ar 7:6

## A5 series — Verse-card backgrounds · 1170×1300 (ratio 9:10) — 8 variants
**Placement:** Today verse card, 340pt tall; bottom 45% is covered by a dark scrim with
ivory text — keep that zone calm and dark. One file per theme; start with `A5-verse-peace.png`
(wired), then register the rest as the rotation grows.

| File | Theme | Scene prompt (append to master) |
|------|-------|--------------------------------|
| `A5-verse-peace.png` | peace | Still mountain lake at night mirroring a gold moon path, thin mist, upper third star-scattered indigo sky. Empty foreground water dark and calm. --ar 9:10 |
| `A5-verse-strength.png` | strength | Lone olive tree on a ridge under indigo night, roots visible in rock, warm gold light striking the trunk from the left horizon. --ar 9:10 |
| `A5-verse-trust.png` | trust | Narrow shepherd's path winding through dark hills toward a distant warm-lit valley, one small lantern glowing mid-path. --ar 9:10 |
| `A5-verse-rest.png` | rest | Quiet interior: an open window at night, curtain breathing in the wind, single candle on the sill lighting deep-blue walls. --ar 9:10 |
| `A5-verse-hope.png` | hope | A single gold sunbeam breaking through heavy indigo clouds onto a small sailing boat on dark water. --ar 9:10 |
| `A5-verse-guidance.png` | guidance | Desert night, a bright gold star low over dunes, faint footprints leading toward it. --ar 9:10 |
| `A5-verse-joy.png` | joy | Field of wheat at golden dawn, backlit seed heads glowing, indigo sky still holding two stars. --ar 9:10 |
| `A5-verse-love.png` | love | Two hands almost touching across warm candlelight, painterly, faceless, deep indigo surroundings. --ar 9:10 |

## A6 — Affirmation spot · `A6-affirmation-spot.png` · 600×600 · transparent
**Placement:** quiz interstitial, 120pt.
> Small spot illustration on transparent background: a pair of cupped hands holding a
> tiny warm flame, gold light spilling between the fingers, loose gouache edges fading
> out. No background shapes. --ar 1:1

## A7 — Plan crest · `A7-plan-crest.png` · 720×720 · transparent
**Placement:** plan-reveal screen, 120pt.
> A personal "covenant seal": laurel of olive branches encircling a rising sun over an
> open book, engraved-medal style but painterly, gold `#D9A441` linework with ivory
> highlights on transparent background, subtle depth, celebratory yet reverent. --ar 1:1

## A8 — Paywall hero · `A8-paywall-hero.png` · 1170×900 (ratio 13:10)
**Placement:** paywall top card, 260pt; bottom half receives dark scrim + white copy —
keep the drama in the upper half.
> Grand but intimate scene: viewer inside a dark stone chapel arch looking out to a
> sunrise, gold light flooding through the arch and catching dust motes, silhouetted
> doorway framing the composition; upper half = luminous sky gradient from `#D9A441`
> at horizon to `#2B2352` above. Awe, invitation, "step into the light". --ar 13:10

## A9 — Thanks / sharing light · `A9-thanks-sharing.png` · 900×900 · transparent
**Placement:** post-purchase screen, 180pt.
> Spot illustration, transparent background: one candle flame being passed from one hand
> to another candle held by a second hand, both flames connected by a soft gold glow,
> faceless painterly hands emerging from darkness. Symbol of giving light forward. --ar 1:1

## A10 — Tonight night sky · `A10-tonight-night.png` · 1170×700 (ratio 5:3)
**Placement:** Today "Tonight" card, 150pt tall, text bottom-left, button bottom-right.
> Horizontal nightscape: crescent moon and stars over sleeping hills, one warm window
> light in a distant tiny house, deep indigo dominant `#0E1220→#1E1A3A`, extremely calm.
> Keep bottom third darkest for text. --ar 5:3

## A11 series — Prayer category tiles · 720×720 · transparent — 6 files
**Placement:** Pray tab tiles (phase: replacing chips), 64pt.
Same spot-art language as A6: single object, gold-lit, transparent bg, loose edges.
| File | Subject |
|------|---------|
| `A11-morning.png` | small rising sun over a windowsill cup |
| `A11-anxiety.png` | storm cloud dissolving into gentle gold rain |
| `A11-gratitude.png` | overflowing small clay cup, gold droplets |
| `A11-sleep.png` | crescent moon resting in a nest of stars |
| `A11-family.png` | little house with one warm lit window |
| `A11-strength.png` | mountain peak with gold light striking the summit |

## A12 — Journal empty state · `A12-journal-empty.png` · 720×720 · transparent
> A tiny seedling sprouting from dark soil inside a beam of warm gold light, two ivory
> leaves, painterly, transparent background, hopeful and modest. --ar 1:1

## A13 series — Reading-plan covers · 1170×700 (ratio 5:3) — 5 files
**Placement:** Bible tab plan cards, 150pt; each card overlays its own tinted gradient,
so keep scenes readable through a color wash; text sits bottom-left.
| File | Plan | Scene |
|------|------|-------|
| `A13-plan-cover.png` (default/first) | Seven Days of Peace | still water and reeds at dusk, indigo-blue wash |
| `A13-gratitude7.png` | The Grateful Week | harvest table with bread and cup, bronze wash |
| `A13-psalms30.png` | 30 Days in the Psalms | harp silhouette against starry sky, violet wash |
| `A13-gospels90.png` | Life of Jesus | fishing boat on Galilee at dawn, teal wash |
| `A13-bible365.png` | Bible in a Year | grand open book with gold-edged pages radiating light, umber wash |

## A14 — Bible header etching · `A14-bible-etching.png` · 1170×400 · transparent
> Very subtle line-art etching of an open book radiating thin gold rays, 12% opacity
> feel, ivory lines on transparent, ornamental but restrained. --ar 3:1

## A15 — Building candle · `A15-building-candle.png` · 600×600 · transparent
**Placement:** "Preparing your plan" screen, 140pt.
> A single candle just being lit, the flame small and growing, gold glow halo, wax ivory,
> transparent background, painterly spot art. Metaphor: something being kindled. --ar 1:1

## A16 — App icon · `A16-appicon.png` · 1024×1024 · opaque
> App icon: the A1 dove-flame logomark centered in gold on the dusk-veil gradient
> (`#2B2352` top → `#0E1220` bottom), very subtle radial gold glow behind the mark,
> no text, no border. Must read at 60 px. Flat, premium, calm. --ar 1:1

## A17 — Splash · `A17-splash.png` · 1284×2778 · opaque
> Splash screen: near-black indigo `#0E1220` field, the gold logomark small at exact
> center with a faint halo, four barely-visible stars in corners. Extremely minimal. --ar 9:19.5

---

## Delivery checklist (for every file)
1. PNG, exact filename above, sRGB. Transparent where marked.
2. Palette check: the only saturated hue is candle gold; background hues stay in the
   indigo family. If a render drifts purple-pink, regenerate.
3. Legibility check: for A4/A5/A8/A10/A13, squint — the text zones (noted per asset)
   must stay dark and quiet.
4. Drop into `src/assets/art/`, register in `src/assets/registry.ts`
   (`'A5-verse-peace': require('./art/A5-verse-peace.png'),`), run the app — the
   placeholder disappears automatically.
