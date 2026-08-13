export const artContrast = {
  /** Guarantees readable light text even over a pure-white source pixel. */
  scrim: 'rgba(0,0,0,0.64)',
  scrimAlpha: 0.64,
  primary: '#F7F1E7',
  secondary: '#E8E4DC',
} as const;

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance([red, green, blue]: readonly number[]) {
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

export function contrastRatio(foreground: readonly number[], background: readonly number[]) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function worstCaseScrimBackground(alpha = artContrast.scrimAlpha) {
  const channelValue = Math.round(255 * (1 - alpha));
  return [channelValue, channelValue, channelValue] as const;
}
