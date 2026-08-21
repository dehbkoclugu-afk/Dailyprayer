import { useEffect, useRef, type RefObject } from 'react';
import { AccessibilityInfo, findNodeHandle, type Text, type View } from 'react-native';

type AccessibilityTarget = Text | View;

function focusTarget(ref: RefObject<AccessibilityTarget | null>) {
  const handle = findNodeHandle(ref.current);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}

/**
 * Moves screen-reader focus into an opened modal and restores it to the
 * control that launched the modal after close.
 */
export function useModalAccessibility(
  visible: boolean,
  headingRef: RefObject<AccessibilityTarget | null>,
  returnFocusHandle?: number | null,
) {
  const wasVisible = useRef(false);

  useEffect(() => {
    const opening = visible && !wasVisible.current;
    const closing = !visible && wasVisible.current;
    wasVisible.current = visible;

    const timer = setTimeout(() => {
      if (opening) focusTarget(headingRef);
      if (closing && returnFocusHandle) AccessibilityInfo.setAccessibilityFocus(returnFocusHandle);
    }, opening ? 350 : 120);

    return () => clearTimeout(timer);
  }, [headingRef, returnFocusHandle, visible]);
}
