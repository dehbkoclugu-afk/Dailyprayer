import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import {
  validateApplicationContentPack,
  type ApplicationContentLocale,
  type ApplicationContentPack,
  type ApplicationContentRelease,
} from '../data/applicationContentPack';
import { APPLICATION_LOCALE_CANDIDATES } from '../i18n/applicationLocales';

const PACK_DIR_NAME = 'lumen-application-content-v1';
const SHA256_RE = /^[a-f0-9]{64}$/i;

function rootDirectory(): string {
  if (!FileSystem.documentDirectory) {
    throw new Error('Application content storage is unavailable');
  }
  return `${FileSystem.documentDirectory}${PACK_DIR_NAME}/`;
}

function packUri(locale: ApplicationContentLocale): string {
  return `${rootDirectory()}${locale}.json`;
}

function backupUri(locale: ApplicationContentLocale): string {
  return `${packUri(locale)}.previous`;
}

async function ensureDirectory(): Promise<void> {
  await FileSystem.makeDirectoryAsync(rootDirectory(), { intermediates: true });
}

async function recoverInterruptedPromotion(locale: ApplicationContentLocale): Promise<void> {
  const target = packUri(locale);
  const backup = backupUri(locale);
  const [targetInfo, backupInfo] = await Promise.all([
    FileSystem.getInfoAsync(target),
    FileSystem.getInfoAsync(backup),
  ]);
  if (targetInfo.exists) {
    if (backupInfo.exists) await FileSystem.deleteAsync(backup, { idempotent: true });
    return;
  }
  if (backupInfo.exists) await FileSystem.moveAsync({ from: backup, to: target });
}

async function verifyText(
  text: string,
  release: ApplicationContentRelease,
): Promise<ApplicationContentPack> {
  if (!SHA256_RE.test(release.sha256)) {
    throw new Error('Application content release SHA-256 is invalid');
  }
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
  if (digest.toLowerCase() !== release.sha256.toLowerCase()) {
    throw new Error(`Application content checksum mismatch for ${release.locale}`);
  }
  return validateApplicationContentPack(JSON.parse(text), release.locale);
}

/** Download, verify, validate, and promote without losing the last valid pack. */
export async function installApplicationContentPack(
  release: ApplicationContentRelease,
): Promise<ApplicationContentPack> {
  if (!/^https:\/\//i.test(release.downloadUrl)) {
    throw new Error('Application content URL must use HTTPS');
  }
  await ensureDirectory();
  await recoverInterruptedPromotion(release.locale);

  const target = packUri(release.locale);
  const temp = `${target}.download`;
  const backup = backupUri(release.locale);
  await FileSystem.deleteAsync(temp, { idempotent: true });

  let previousMoved = false;
  try {
    const result = await FileSystem.downloadAsync(release.downloadUrl, temp);
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Application content download failed: HTTP ${result.status}`);
    }
    const text = await FileSystem.readAsStringAsync(temp, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const pack = await verifyText(text, release);

    const existing = await FileSystem.getInfoAsync(target);
    if (existing.exists) {
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
      if (!current.exists) {
        await FileSystem.moveAsync({ from: backup, to: target }).catch(() => {});
      }
    }
    throw error;
  }
}

export async function loadInstalledApplicationContentPack(
  locale: ApplicationContentLocale,
): Promise<ApplicationContentPack | null> {
  await ensureDirectory();
  await recoverInterruptedPromotion(locale);
  const uri = packUri(locale);
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return null;
  const text = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return validateApplicationContentPack(JSON.parse(text), locale);
}

export async function isApplicationContentPackInstalled(
  locale: ApplicationContentLocale,
): Promise<boolean> {
  await ensureDirectory();
  await recoverInterruptedPromotion(locale);
  return (await FileSystem.getInfoAsync(packUri(locale))).exists;
}

export async function removeInstalledApplicationContentPack(
  locale: ApplicationContentLocale,
): Promise<void> {
  await FileSystem.deleteAsync(packUri(locale), { idempotent: true });
  await FileSystem.deleteAsync(backupUri(locale), { idempotent: true });
}

export async function listInstalledApplicationContentPacks(): Promise<ApplicationContentLocale[]> {
  await ensureDirectory();
  const allowed = new Set<string>(APPLICATION_LOCALE_CANDIDATES.map((locale) => locale.tag));
  const files = await FileSystem.readDirectoryAsync(rootDirectory());
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5))
    .filter((locale): locale is ApplicationContentLocale => allowed.has(locale));
}
