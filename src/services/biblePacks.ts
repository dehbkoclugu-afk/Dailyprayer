import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { GLOBAL_LOCALE_TAGS, type GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { type BiblePack, type BiblePackRelease, validateBiblePack } from '@/data/biblePack';

const PACK_DIR_NAME = 'lumen-bible-packs-v2';
const SHA256_RE = /^[a-f0-9]{64}$/i;

function rootDirectory(): string {
  if (!FileSystem.documentDirectory) throw new Error('Bible pack storage is unavailable');
  return `${FileSystem.documentDirectory}${PACK_DIR_NAME}/`;
}

function packUri(locale: GlobalLocaleTag): string {
  return `${rootDirectory()}${locale}.json`;
}

function backupUri(locale: GlobalLocaleTag): string {
  return `${packUri(locale)}.previous`;
}

async function recoverInterruptedPromotion(locale: GlobalLocaleTag): Promise<void> {
  const target = packUri(locale);
  const backup = backupUri(locale);
  const [targetInfo, backupInfo] = await Promise.all([
    FileSystem.getInfoAsync(target),
    FileSystem.getInfoAsync(backup),
  ]);
  if (targetInfo.exists) {
    if (backupInfo.exists) await FileSystem.deleteAsync(backup, { idempotent: true });
  } else if (backupInfo.exists) {
    await FileSystem.moveAsync({ from: backup, to: target });
  }
}

async function ensureDirectory(): Promise<void> {
  await FileSystem.makeDirectoryAsync(rootDirectory(), { intermediates: true });
}

async function verifyText(text: string, release: BiblePackRelease): Promise<BiblePack> {
  if (!SHA256_RE.test(release.sha256)) throw new Error('Bible pack release SHA-256 is invalid');
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
  if (digest.toLowerCase() !== release.sha256.toLowerCase()) {
    throw new Error(`Bible pack checksum mismatch for ${release.locale}`);
  }
  return validateBiblePack(JSON.parse(text), release.locale);
}

/** Download, SHA-256 verify and structurally validate before replacing the offline copy. */
export async function installBiblePack(release: BiblePackRelease): Promise<BiblePack> {
  if (!/^https:\/\//i.test(release.downloadUrl)) throw new Error('Bible pack URL must use HTTPS');
  await ensureDirectory();
  await recoverInterruptedPromotion(release.locale);

  const target = packUri(release.locale);
  const temp = `${target}.download`;
  const backup = backupUri(release.locale);
  const existingTemp = await FileSystem.getInfoAsync(temp);
  if (existingTemp.exists) await FileSystem.deleteAsync(temp, { idempotent: true });

  let previousMoved = false;
  try {
    const result = await FileSystem.downloadAsync(release.downloadUrl, temp);
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`Bible pack download failed: HTTP ${result.status}`);
    }
    const text = await FileSystem.readAsStringAsync(temp, { encoding: FileSystem.EncodingType.UTF8 });
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
      if (!current.exists) await FileSystem.moveAsync({ from: backup, to: target }).catch(() => {});
    }
    throw error;
  }
}

/** Load an already verified offline pack and re-run the schema/canon checks. */
export async function loadInstalledBiblePack(locale: GlobalLocaleTag): Promise<BiblePack | null> {
  await ensureDirectory();
  await recoverInterruptedPromotion(locale);
  const uri = packUri(locale);
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return null;
  const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  return validateBiblePack(JSON.parse(text), locale);
}

export async function removeInstalledBiblePack(locale: GlobalLocaleTag): Promise<void> {
  await FileSystem.deleteAsync(packUri(locale), { idempotent: true });
  await FileSystem.deleteAsync(backupUri(locale), { idempotent: true });
}

export async function isBiblePackInstalled(locale: GlobalLocaleTag): Promise<boolean> {
  return (await FileSystem.getInfoAsync(packUri(locale))).exists;
}

export async function listInstalledBiblePacks(): Promise<GlobalLocaleTag[]> {
  const root = rootDirectory();
  const info = await FileSystem.getInfoAsync(root);
  if (!info.exists) return [];
  const allowed = new Set<string>(GLOBAL_LOCALE_TAGS);
  const files = await FileSystem.readDirectoryAsync(root);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5))
    .filter((tag): tag is GlobalLocaleTag => allowed.has(tag));
}
