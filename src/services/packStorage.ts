/**
 * Offline storage for downloaded, checksum-pinned JSON packs (Bible editions
 * and application content). One implementation for both: download to a temp
 * file with progress, verify size + SHA-256 + schema, then promote atomically
 * while keeping the previous pack until the new one is in place.
 */
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { SHA256_RE, type PackRelease } from '@/services/releaseManifest';

export interface PackStore<L extends string, P> {
  install: (release: PackRelease<L>, onProgress?: (fraction: number) => void) => Promise<P>;
  load: (locale: L) => Promise<P | null>;
  isInstalled: (locale: L) => Promise<boolean>;
  remove: (locale: L) => Promise<void>;
  list: (allowed: ReadonlySet<string>) => Promise<L[]>;
}

export function createPackStore<L extends string, P>(options: {
  directoryName: string;
  label: string;
  validate: (value: unknown, locale: L) => P;
}): PackStore<L, P> {
  const { directoryName, label, validate } = options;

  const root = () => {
    if (!FileSystem.documentDirectory) throw new Error(`${label} storage is unavailable`);
    return `${FileSystem.documentDirectory}${directoryName}/`;
  };
  const packUri = (locale: L) => `${root()}${locale}.json`;
  const backupUri = (locale: L) => `${packUri(locale)}.previous`;
  const ensureDirectory = () => FileSystem.makeDirectoryAsync(root(), { intermediates: true });

  /** Finish a promotion that was interrupted between the two moves. */
  async function recover(locale: L): Promise<void> {
    const [target, backup] = await Promise.all([
      FileSystem.getInfoAsync(packUri(locale)),
      FileSystem.getInfoAsync(backupUri(locale)),
    ]);
    if (target.exists) {
      if (backup.exists) await FileSystem.deleteAsync(backupUri(locale), { idempotent: true });
      return;
    }
    if (backup.exists) await FileSystem.moveAsync({ from: backupUri(locale), to: packUri(locale) });
  }

  async function verify(text: string, release: PackRelease<L>): Promise<P> {
    if (!SHA256_RE.test(release.sha256)) throw new Error(`${label} release SHA-256 is invalid`);
    const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
    if (digest.toLowerCase() !== release.sha256.toLowerCase()) {
      throw new Error(`${label} checksum mismatch for ${release.locale}`);
    }
    return validate(JSON.parse(text), release.locale);
  }

  return {
    async install(release, onProgress) {
      if (!/^https:\/\//i.test(release.downloadUrl)) throw new Error(`${label} URL must use HTTPS`);
      await ensureDirectory();
      await recover(release.locale);
      const target = packUri(release.locale);
      const backup = backupUri(release.locale);
      const temp = `${target}.download`;
      await FileSystem.deleteAsync(temp, { idempotent: true });

      let previousMoved = false;
      try {
        const download = FileSystem.createDownloadResumable(release.downloadUrl, temp, {}, (event) => {
          const total = event.totalBytesExpectedToWrite > 0 ? event.totalBytesExpectedToWrite : release.bytes;
          if (event.totalBytesWritten > release.bytes * 1.1) {
            download.cancelAsync().catch(() => {});
          }
          onProgress?.(Math.min(1, event.totalBytesWritten / total));
        });
        const result = await download.downloadAsync();
        if (!result || result.status < 200 || result.status >= 300) {
          throw new Error(`${label} download failed: HTTP ${result?.status ?? 'cancelled'}`);
        }
        const info = await FileSystem.getInfoAsync(temp);
        if (!info.exists || info.size !== release.bytes) {
          throw new Error(`${label} size mismatch for ${release.locale}`);
        }
        const text = await FileSystem.readAsStringAsync(temp, { encoding: FileSystem.EncodingType.UTF8 });
        const pack = await verify(text, release);

        if ((await FileSystem.getInfoAsync(target)).exists) {
          await FileSystem.deleteAsync(backup, { idempotent: true });
          await FileSystem.moveAsync({ from: target, to: backup });
          previousMoved = true;
        }
        await FileSystem.moveAsync({ from: temp, to: target });
        await FileSystem.deleteAsync(backup, { idempotent: true });
        return pack;
      } catch (error) {
        await FileSystem.deleteAsync(temp, { idempotent: true }).catch(() => {});
        if (previousMoved) {
          const current = await FileSystem.getInfoAsync(target).catch(() => ({ exists: false }));
          if (!current.exists) await FileSystem.moveAsync({ from: backup, to: target }).catch(() => {});
        }
        throw error;
      }
    },

    async load(locale) {
      await ensureDirectory();
      await recover(locale);
      const uri = packUri(locale);
      if (!(await FileSystem.getInfoAsync(uri)).exists) return null;
      const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
      return validate(JSON.parse(text), locale);
    },

    async isInstalled(locale) {
      await ensureDirectory();
      await recover(locale);
      return (await FileSystem.getInfoAsync(packUri(locale))).exists;
    },

    async remove(locale) {
      await FileSystem.deleteAsync(packUri(locale), { idempotent: true });
      await FileSystem.deleteAsync(backupUri(locale), { idempotent: true });
    },

    async list(allowed) {
      await ensureDirectory();
      const files = await FileSystem.readDirectoryAsync(root());
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.slice(0, -5))
        .filter((locale): locale is L => allowed.has(locale));
    },
  };
}
