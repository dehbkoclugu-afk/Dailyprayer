import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export class AESEncryptionKey {
  readonly bytes: Buffer;
  constructor(bytes: Buffer) { this.bytes = bytes; }
  static async generate(): Promise<AESEncryptionKey> { return new AESEncryptionKey(randomBytes(32)); }
  static async import(value: string): Promise<AESEncryptionKey> { return new AESEncryptionKey(Buffer.from(value, 'hex')); }
  async encoded(): Promise<string> { return this.bytes.toString('hex'); }
}

export class AESSealedData {
  readonly bytes: Buffer;
  constructor(bytes: Buffer) { this.bytes = bytes; }
  static fromCombined(value: string): AESSealedData { return new AESSealedData(Buffer.from(value, 'base64')); }
  async combined(): Promise<string> { return this.bytes.toString('base64'); }
}

export async function aesEncryptAsync(value: Uint8Array, key: AESEncryptionKey): Promise<AESSealedData> {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key.bytes, iv);
  const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
  return new AESSealedData(Buffer.concat([iv, encrypted, cipher.getAuthTag()]));
}

export async function aesDecryptAsync(value: AESSealedData, key: AESEncryptionKey): Promise<Uint8Array> {
  const iv = value.bytes.subarray(0, 12);
  const tag = value.bytes.subarray(-16);
  const decipher = createDecipheriv('aes-256-gcm', key.bytes, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(value.bytes.subarray(12, -16)), decipher.final()]);
}
