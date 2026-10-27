import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { getBible, isBibleLoaded, type FullBook } from '@/data/bibleFull';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';

/**
 * The full text of an edition. The first use of a bundled edition parses ~4 MB
 * of JSON on the JS thread, so it is deferred until navigation animations have
 * finished; callers render a lightweight loading state until then.
 */
export function useBible(locale: GlobalLocaleTag): FullBook[] | null {
  const [bible, setBible] = useState<FullBook[] | null>(() =>
    isBibleLoaded(locale) ? getBible(locale) : null,
  );

  useEffect(() => {
    if (isBibleLoaded(locale)) {
      setBible(getBible(locale));
      return;
    }
    setBible(null);
    const task = InteractionManager.runAfterInteractions(() => setBible(getBible(locale)));
    return () => task.cancel();
  }, [locale]);

  return bible;
}
