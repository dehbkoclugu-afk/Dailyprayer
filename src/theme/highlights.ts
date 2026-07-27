/**
 * Verse highlight palette. Colors are semi-transparent so a single value reads
 * correctly on every reading surface (dark vigil, light dawn, sepia paper).
 * The store persists the NAME; the UI resolves it through this map.
 */
import type { TranslationKey } from '@/i18n/translations';

export type HighlightColor = 'gold' | 'rose' | 'green' | 'blue';

export const HIGHLIGHT_ORDER: HighlightColor[] = ['gold', 'rose', 'green', 'blue'];

/** The colour applied by the reader's long-press shortcut, which offers no choice. */
export const QUICK_HIGHLIGHT: HighlightColor = 'gold';

/**
 * What each colour is called out loud (roadmap item 26). The swatch label was
 * built as `${tr('verse.highlight')} ${c}`, so TalkBack read the storage key:
 * "Highlight gold" in every language, including the five that have no such word.
 *
 * Typed as TranslationKey rather than interpolated into `tr()` with `as never`,
 * so renaming a key breaks the build instead of falling back to English at runtime.
 */
export const HIGHLIGHT_LABEL: Record<HighlightColor, TranslationKey> = {
  gold: 'highlight.gold',
  rose: 'highlight.rose',
  green: 'highlight.green',
  blue: 'highlight.blue',
};

/** Wash used behind the verse text. */
export const HIGHLIGHT_TINT: Record<HighlightColor, string> = {
  gold: 'rgba(217,164,65,0.24)',
  rose: 'rgba(217,123,108,0.24)',
  green: 'rgba(127,181,138,0.24)',
  blue: 'rgba(124,156,217,0.26)',
};

/** Solid swatch shown in the picker. */
export const HIGHLIGHT_SWATCH: Record<HighlightColor, string> = {
  gold: '#D9A441',
  rose: '#D97B6C',
  green: '#7FB58A',
  blue: '#7C9CD9',
};
