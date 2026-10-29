export const EXPANDED_WIDTH = 840;
export const SHORT_HEIGHT = 620;

export function isExpandedLayout(width: number) {
  return width >= EXPANDED_WIDTH;
}

export function contentMaxWidth(width: number) {
  return isExpandedLayout(width) ? 1120 : 480;
}

/** Short-height includes phones in landscape and compact split-screen windows. */
export function isShortLayout(height: number, fontScale = 1) {
  return height / Math.max(1, fontScale) < SHORT_HEIGHT;
}

/**
 * A centre gutter keeps independent expanded-layout panes away from a foldable
 * hinge. The value also works as a calm tablet column gap when no hinge exists.
 */
export function foldablePaneGap(width: number) {
  if (!isExpandedLayout(width)) return 0;
  return Math.max(32, Math.min(56, Math.round(width * 0.04)));
}

export function expandedPaneWidth(containerWidth: number) {
  return isExpandedLayout(containerWidth)
    ? (containerWidth - foldablePaneGap(containerWidth)) / 2
    : containerWidth;
}
