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

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 44 },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fonts.sansSemiBold, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 26 },
  secondary: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  verse: { fontFamily: fonts.serifLight, fontSize: 26, lineHeight: 38 },
  /**
   * The small caps label above a hero title — "VERSE OF THE DAY", "CONTINUE
   * READING", "CHAPTER 23" (roadmap item 31). Five call sites had built this
   * from the same four raw values (`fontSize: 11, letterSpacing: 2.5,
   * textTransform: 'uppercase', fontFamily: fonts.sansSemiBold`)
   * independently, each free to drift the next time one of them changed.
   * Colour is deliberately not part of the role — every call site tints it to
   * match its own art or surface, only the shape is shared.
   *
   * A few other small-caps labels in the app (VerseActionSheet's swatch
   * section header, the devotional's eyebrow) use a *different* size and
   * letter-spacing on purpose, not as drift from this one — they were left
   * alone rather than folded in without knowing whether that was designed.
   */
  overline: { fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase' as const },
} as const;
