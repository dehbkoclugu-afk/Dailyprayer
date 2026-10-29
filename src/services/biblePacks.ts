import { GLOBAL_LOCALE_TAGS, type GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { type BiblePack, type BiblePackRelease, validateBiblePack } from '@/data/biblePack';
import { createPackStore } from '@/services/packStorage';

const store = createPackStore<GlobalLocaleTag, BiblePack>({
  directoryName: 'lumen-bible-packs-v2',
  label: 'Bible pack',
  validate: validateBiblePack,
});

/** Download, size + SHA-256 verify and validate before atomically replacing the offline copy. */
export function installBiblePack(
  release: BiblePackRelease,
  onProgress?: (fraction: number) => void,
): Promise<BiblePack> {
  return store.install(release, onProgress);
}

/** Load an already verified offline pack and re-run the schema/canon checks. */
export const loadInstalledBiblePack = store.load;
export const removeInstalledBiblePack = store.remove;

export function listInstalledBiblePacks(): Promise<GlobalLocaleTag[]> {
  return store.list(new Set<string>(GLOBAL_LOCALE_TAGS));
}
