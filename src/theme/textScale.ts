import { useWindowDimensions } from 'react-native';
import { CHROME_SCALE_CAP, isStacked, scaleHeight, STACK_SCALE } from './textScale.logic';

export { CHROME_SCALE_CAP, STACK_SCALE };

/**
 * The device's text-size setting, as a multiplier (roadmap item 30).
 *
 * This is not the reader's in-app font scale — that one lives in
 * `useReaderPrefsStore` and only sizes Scripture. This is the OS accessibility
 * setting, which React Native applies to every `<Text>` automatically. That
 * automatic part is the problem: the text grows, the box around it does not, and
 * a box with a fixed `height` clips whatever no longer fits.
 *
 * `useWindowDimensions` is the reactive source — it re-renders when the setting
 * changes, which on Android can happen while the app is open.
 */
export function useTextScale(): number {
  const { fontScale } = useWindowDimensions();
  return Number.isFinite(fontScale) && fontScale > 0 ? fontScale : 1;
}

/** A height measured against default-size text, grown by the reader's setting. */
export function useScaledHeight(base: number, cap = Infinity): number {
  return scaleHeight(base, useTextScale(), cap);
}

/** True when a horizontal row of text should become a vertical stack. */
export function useStackedLayout(): boolean {
  return isStacked(useTextScale());
}
