const secrets = new Map<string, string>();
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'WHEN_UNLOCKED_THIS_DEVICE_ONLY';
export const __reset = () => secrets.clear();
export async function getItemAsync(name: string): Promise<string | null> { return secrets.get(name) ?? null; }
export async function setItemAsync(name: string, value: string): Promise<void> { secrets.set(name, value); }
