import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion as useReanimatedStaticValue } from 'react-native-reanimated';

/**
 * Whether the reader has asked the system to reduce motion (roadmap item 36).
 *
 * There were two ways of asking this in the app and both went stale. Reanimated's
 * `useReducedMotion()` reads the setting once when the JS bundle loads and says so
 * in its own documentation — "whether the reduced motion setting was enabled when
 * the app started"; it is a module constant, not a hook over live state.
 * `StreakFlame` did its own one-shot `isReduceMotionEnabled()` promise, which has
 * the same problem in different clothes.
 *
 * That matters here rather than being pedantry. On Android, "Remove animations"
 * lives in Settings, so the way anyone actually turns it on is: notice the app is
 * making them queasy, leave, change the setting, come back. The app is not
 * restarted by that, so both readings would still say motion is fine — the one
 * moment the setting exists for is the one moment neither could see.
 *
 * So: seed from Reanimated's synchronous value, because an async read leaves a
 * frame or two where an entering animation has already started, then correct it
 * and subscribe. `reduceMotionChanged` is the platform event for exactly this.
 */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(useReanimatedStaticValue);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) setReduced(value);
      })
      .catch(() => {
        // A platform that cannot answer keeps the seeded value. Failing closed to
        // "reduce" would silence motion for everyone on that platform.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
