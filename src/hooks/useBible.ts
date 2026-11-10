import { useEffect, useReducer } from 'react';
import { InteractionManager } from 'react-native';
import { getBible, isBibleLoaded, type FullBook } from '@/data/bibleFull';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';

/**
 * The full text of an edition. The first use of a bundled edition parses ~4 MB
 * of JSON on the JS thread, so it is deferred until navigation animations have
 * finished; callers render a lightweight loading state until then.
 */
export function useBible(locale: GlobalLocaleTag): FullBook[] | null {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const loaded = isBibleLoaded(locale);

  useEffect(() => {
    if (loaded) return;
    const task = InteractionManager.runAfterInteractions(() => {
      getBible(locale);
      rerender();
    });
    return () => task.cancel();
  }, [loaded, locale]);

  return loaded ? getBible(locale) : null;
}
