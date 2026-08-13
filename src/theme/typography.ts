export const fonts = {
  /** Editorial serif , scripture, display headings */
  serif: 'Fraunces_600SemiBold',
  serifLight: 'Fraunces_400Regular',
  /** Humanist sans , UI */
  sans: 'Figtree_400Regular',
  sansMedium: 'Figtree_500Medium',
  sansSemiBold: 'Figtree_600SemiBold',
  sansBold: 'Figtree_700Bold',
} as const;

export const type = {
  displayHero: { fontFamily: fonts.serif, fontSize: 64, lineHeight: 68 },
  displayNumeral: { fontFamily: fonts.serif, fontSize: 46, lineHeight: 46 },
  display: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 44 },
  displaySmall: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40 },
  titleLarge: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  titleSmall: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 31 },
  titleCompact: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 28 },
  editorialBody: { fontFamily: fonts.serifLight, fontSize: 18, lineHeight: 28 },
  readerVerse: { fontFamily: fonts.serifLight, fontSize: 18, lineHeight: 30 },
  editorialCompact: { fontFamily: fonts.serifLight, fontSize: 17, lineHeight: 26 },
  editorialSecondary: { fontFamily: fonts.serifLight, fontSize: 15, lineHeight: 22 },
  editorialQuote: { fontFamily: fonts.serifLight, fontSize: 19, lineHeight: 30 },
  playerVerse: { fontFamily: fonts.serifLight, fontSize: 30, lineHeight: 43 },
  heading: { fontFamily: fonts.sansSemiBold, fontSize: 22, lineHeight: 28 },
  subheading: { fontFamily: fonts.sansSemiBold, fontSize: 20, lineHeight: 26 },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 26 },
  bodyStrong: { fontFamily: fonts.sansSemiBold, fontSize: 17, lineHeight: 26 },
  bodyCompact: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 22 },
  bodyCompactMedium: { fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 22 },
  bodyCompactStrong: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 22 },
  bodyCompactComfortable: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  bodyInput: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25 },
  bodyLargeStrong: { fontFamily: fonts.sansSemiBold, fontSize: 18, lineHeight: 28 },
  secondary: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  secondaryMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
  secondaryStrong: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 22 },
  secondaryComfortable: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  captionRegular: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18 },
  captionComfortable: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19 },
  captionComfortableRegular: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 14, lineHeight: 20 },
  labelRegular: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  labelMedium: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 },
  labelSmall: { fontFamily: fonts.sansSemiBold, fontSize: 12, lineHeight: 16 },
  labelSmallRegular: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 },
  labelSmallMedium: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 16 },
  labelSmallBold: { fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 16 },
  labelSmallComfortable: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  metric: { fontFamily: fonts.sansBold, fontSize: 30, lineHeight: 36 },
  metricSmall: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 24 },
  overline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.8,
  },
  verse: { fontFamily: fonts.serifLight, fontSize: 26, lineHeight: 38 },
  wordmark: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 24 },
} as const;

export type TypeRole = keyof typeof type;

export function scaledType(role: TypeRole, scale: number) {
  const base = type[role];
  return {
    ...base,
    fontSize: Math.round(base.fontSize * scale),
    lineHeight: Math.round(base.lineHeight * scale),
  };
}

export const verseCardTypes = [
  { ...type.titleSmall, fontFamily: fonts.serifLight, lineHeight: 35 },
  { ...type.titleCompact, fontFamily: fonts.serifLight, lineHeight: 31 },
  { ...type.editorialBody, lineHeight: 27 },
  { ...type.bodyCompactComfortable, fontFamily: fonts.serifLight },
] as const;
