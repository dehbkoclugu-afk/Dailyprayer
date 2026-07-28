/**
 * The text-scaling rules, as pure functions (roadmap item 30).
 *
 * Split from `textScale.ts` for the same reason `planReadings.logic.ts` is split
 * from its screen: the hooks reach `react-native`, whose entry point is Flow-typed
 * and cannot be imported by the plain Node test runner. The arithmetic is the part
 * worth testing, and it has no reason to know about React.
 */

/**
 * Chrome grows more slowly than content.
 *
 * A tab bar or a toolbar is a fixed cost paid on every screen: at 200% a linearly
 * grown bar takes a third of a phone, leaving less room for the thing the reader
 * enlarged the text to read. Capping it means a label may wrap or ellipsize there,
 * which is the right trade for a control whose icon already carries the meaning.
 * Content boxes get the full growth — clipping a verse is never acceptable.
 */
export const CHROME_SCALE_CAP = 1.4;

/**
 * Past this, side-by-side text no longer fits and a row has to stack.
 *
 * Two labels sharing a row each get half the width; enlarged, they either wrap to
 * three lines each or truncate. 1.3 is where that starts in these layouts — the
 * Bible tab's two quick actions are the tightest pair, at roughly half a 420dp
 * screen each minus the icon and gap.
 */
export const STACK_SCALE = 1.3;

/**
 * A height measured against default-size text, grown by the reader's setting.
 *
 * Scaling starts at 1: someone who has made text *smaller* has not asked for a
 * smaller verse card, and shrinking the frame would only crop the artwork behind
 * it. A non-finite or absent scale means the platform did not tell us, and 1 is
 * the only safe answer — guessing high would waste the screen for everyone.
 */
export function scaleHeight(base: number, scale: number, cap = Infinity): number {
  const safe = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return Math.round(base * Math.min(Math.max(safe, 1), cap));
}

/** True when a horizontal row of text should become a vertical stack. */
export function isStacked(scale: number): boolean {
  return Number.isFinite(scale) && scale >= STACK_SCALE;
}
