export type MotionPattern = 'sharedAxis' | 'fadeThrough' | 'container';

export type RouterAnimation = 'none' | 'fade' | 'slide_from_right' | 'slide_from_bottom';

export interface MotionConfig<Animation extends RouterAnimation = RouterAnimation> {
  animation: Animation;
}

const motion: Record<MotionPattern, MotionConfig> = {
  sharedAxis: { animation: 'slide_from_right' },
  fadeThrough: { animation: 'fade' },
  container: { animation: 'slide_from_bottom' },
};

/** Resolves the small, native navigation vocabulary with static fallbacks. */
export function resolveMotionPattern(pattern: 'sharedAxis', reduceMotion: boolean): MotionConfig<'none' | 'slide_from_right'>;
export function resolveMotionPattern(pattern: 'fadeThrough', reduceMotion: boolean): MotionConfig<'fade'>;
export function resolveMotionPattern(pattern: 'container', reduceMotion: boolean): MotionConfig<'fade' | 'slide_from_bottom'>;
export function resolveMotionPattern(pattern: MotionPattern, reduceMotion: boolean): MotionConfig {
  if (!reduceMotion) return motion[pattern];
  return { animation: pattern === 'sharedAxis' ? 'none' : 'fade' };
}
