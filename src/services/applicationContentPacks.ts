import {
  validateApplicationContentPack,
  type ApplicationContentLocale,
  type ApplicationContentPack,
  type ApplicationContentRelease,
} from '../data/applicationContentPack';
import { APPLICATION_LOCALE_CANDIDATES } from '../i18n/applicationLocales';
import { createPackStore } from '@/services/packStorage';

const store = createPackStore<ApplicationContentLocale, ApplicationContentPack>({
  directoryName: 'lumen-application-content-v1',
  label: 'Application content',
  validate: validateApplicationContentPack,
});

/** Download, verify, validate, and promote without losing the last valid pack. */
export function installApplicationContentPack(
  release: ApplicationContentRelease,
  onProgress?: (fraction: number) => void,
): Promise<ApplicationContentPack> {
  return store.install(release, onProgress);
}

export const loadInstalledApplicationContentPack = store.load;
export const isApplicationContentPackInstalled = store.isInstalled;
export const removeInstalledApplicationContentPack = store.remove;

export function listInstalledApplicationContentPacks(): Promise<ApplicationContentLocale[]> {
  return store.list(new Set<string>(APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag)));
}
