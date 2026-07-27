import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, type View } from 'react-native';

/**
 * Screen-reader focus for bottom sheets (roadmap item 28).
 *
 * A sheet slides up over the screen, but accessibility focus does not follow it.
 * TalkBack and VoiceOver stay wherever they were — usually on the control that
 * opened the sheet, which is now behind it — so the sheet has to be found by
 * swiping, and there is no announcement that anything opened at all.
 *
 * Containment is already handled, but by two different mechanisms and it is worth
 * being exact about which:
 *
 *  - **Android:** RN's `Modal` is a `Dialog`, a separate window. TalkBack does not
 *    traverse into the window behind it, so containment is free.
 *  - **iOS:** there is no second window; the sheet is a sibling view and VoiceOver
 *    will happily walk past it into the screen underneath. `accessibilityViewIsModal`
 *    is what stops that, and it is **iOS-only** — it does nothing on Android.
 *
 * What neither platform does is move focus *into* the sheet, or put it back
 * afterwards. That is what these two hooks are for.
 */

/** How long to wait for the slide-in before moving focus. */
const SLIDE_MS = 320;

function focus(node: View | null) {
  // findNodeHandle *throws* on web rather than returning null, and there is no
  // accessibility-focus API there to call anyway — the browser owns focus. The
  // web export is only a verification harness, but an exception on every sheet
  // open would drown out the real errors it exists to surface.
  if (Platform.OS === 'web' || !node) return;
  const tag = findNodeHandle(node);
  if (tag != null) AccessibilityInfo.setAccessibilityFocus(tag);
}

/**
 * Attach the returned ref to the sheet's title. When the sheet opens, focus lands
 * there instead of staying behind the sheet.
 *
 * The delay matters: setting focus while the sheet is still animating in targets a
 * view that is off-screen, and the platform drops it.
 */
export function useSheetTitleFocus(visible: boolean, stage?: unknown) {
  const titleRef = useRef<View>(null);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => focus(titleRef.current), SLIDE_MS);
    return () => clearTimeout(timer);
    // `stage` re-runs it when a sheet rewrites its own title in place — the
    // deletion sheet's second confirmation is a different question in the same
    // frame, and a reader who does not hear it re-read is answering the first one.
  }, [visible, stage]);
  return titleRef;
}

/**
 * Attach the returned ref to the control that opens a sheet. When the sheet
 * closes, focus returns to it rather than to the top of the screen.
 *
 * Only fires on the true→false edge, so it does not steal focus on first render.
 */
export function useTriggerFocus(visible: boolean) {
  const triggerRef = useRef<View>(null);
  const wasVisible = useRef(visible);
  useEffect(() => {
    const closed = wasVisible.current && !visible;
    wasVisible.current = visible;
    if (!closed) return;
    const timer = setTimeout(() => focus(triggerRef.current), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [visible]);
  return triggerRef;
}
