export const EXPANDED_WIDTH = 840;

export function isExpandedLayout(width: number) {
  return width >= EXPANDED_WIDTH;
}

export function contentMaxWidth(width: number) {
  return isExpandedLayout(width) ? 1120 : 480;
}
