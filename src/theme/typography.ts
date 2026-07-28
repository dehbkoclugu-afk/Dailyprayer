export const fonts = {
  /** Editorial serif — scripture, display headings */
  serif: 'Fraunces_600SemiBold',
  serifLight: 'Fraunces_400Regular',
  /** Humanist sans — UI */
  sans: 'Figtree_400Regular',
  sansMedium: 'Figtree_500Medium',
  sansSemiBold: 'Figtree_600SemiBold',
  sansBold: 'Figtree_700Bold',
} as const;

/**
 * The type scale (roadmap item 31).
 *
 * Before this there were twenty-one distinct `fontSize` literals across the app —
 * 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 30, 34, 46,
 * 64 — spread over 163 call sites and crossed with five weights. Nothing decided
 * which to use, so the same kind of text was 13 on one screen and 14 on the next,
 * and there was no single place to change how supporting text reads.
 *
 * Eight steps, each a role rather than a measurement. The sizes are the ones the
 * app already used, with near-neighbours folded onto the nearest step: 16 and 18
 * became body, 14 became callout, 12 became label, 10 became overline. Nothing
 * moved more than 2dp, so this is the same design with the accidents removed —
 * deliberate changes to the smaller end are roadmap item 32's job, and having one
 * step to change is what makes that possible.
 *
 * Weight is a separate axis from size. A role that appears in several weights is
 * spelled out per weight rather than merged into the caller's style object, so a
 * call site names one thing and the scale owns both numbers.
 */

/** Line heights are part of the role: a size without leading is half a decision. */
export const type = {
  /**
   * Ornamental single glyphs. The devotional's opening letter and the plan day's
   * quote mark are drawn, not read — they carry no meaning a screen reader needs
   * and are sized as decoration.
   */
  dropCap: { fontFamily: fonts.serif, fontSize: 64, lineHeight: 64 },
  pullQuote: { fontFamily: fonts.serif, fontSize: 46, lineHeight: 46 },

  /** Serif display ladder — the editorial voice. */
  display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  subtitle: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 28 },

  /** Scripture and quoted text, in the lighter serif. */
  verse: { fontFamily: fonts.serifLight, fontSize: 26, lineHeight: 38 },
  quote: { fontFamily: fonts.serifLight, fontSize: 19, lineHeight: 28 },
  quoteSmall: { fontFamily: fonts.serifLight, fontSize: 16, lineHeight: 24 },

  /** A section heading in the UI voice rather than the editorial one. */
  headingSans: { fontFamily: fonts.sansSemiBold, fontSize: 21, lineHeight: 28 },
  /** A number read at a glance — streak counts, totals. Tabular by convention. */
  stat: { fontFamily: fonts.sansBold, fontSize: 30, lineHeight: 36 },

  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 26 },
  bodySemi: { fontFamily: fonts.sansSemiBold, fontSize: 17, lineHeight: 24 },
  bodyBold: { fontFamily: fonts.sansBold, fontSize: 17, lineHeight: 24 },

  /** Supporting text: the most-used step in the app. */
  callout: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  calloutMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
  calloutSemi: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 22 },
  calloutBold: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 22 },

  /** Captions and metadata. */
  label: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  labelMedium: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  labelSemi: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18 },
  labelBold: { fontFamily: fonts.sansBold, fontSize: 13, lineHeight: 18 },

  /**
   * The smallest step: eyebrows, badges, art credits.
   *
   * This is the floor, and it is a low one — roadmap item 32 raises it. It exists
   * as one step so that raise is one edit rather than twelve.
   */
  overline: { fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 16 },
  overlineMedium: { fontFamily: fonts.sansMedium, fontSize: 11, lineHeight: 16 },
  overlineBold: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 16 },
} as const;

export type TypeRole = keyof typeof type;

/**
 * The reader's own scale.
 *
 * Scripture in the reader is the one place with a user-facing size control, so
 * its sizes are a base multiplied by `useReaderPrefsStore.fontScale` rather than
 * a fixed step. The bases still belong here — they were four more scattered
 * literals inside `read.tsx`, and the reading size is the most consequential
 * number in the app.
 *
 * `body` is 18 rather than the UI's 17 on purpose: sustained reading of a light
 * serif wants a little more than interface text, and the reader's leading is set
 * from `line` rather than the role's, because a long passage needs more air than
 * a paragraph of UI copy.
 */
export const reader = {
  /** Scripture body, before the reader's multiplier. */
  body: 18,
  /** Leading for that body — deliberately looser than any UI role. */
  line: 30,
  /** The chapter number above the text. */
  chapterTitle: 30,
  /** The verse number set into the run of text. */
  verseNumber: 11,
  /** The opening letter of a chapter, as a multiple of the body size. */
  dropCapRatio: 1.9,
} as const;
