const LOCAL_USER_DATA_KEYS = new Set([
  'lumen-user',
  'lumen-streak',
  'lumen-journal',
  'lumen-prayers',
  'lumen-bookmarks',
  'lumen-highlights',
  'lumen-plans',
  'lumen-reader',
  'lumen-reader-prefs',
  'lumen-bible',
  'lumen-entitlement',
]);

export function selectLocalUserDataKeys(keys: readonly string[]): string[] {
  return keys.filter((key) => LOCAL_USER_DATA_KEYS.has(key) || key.startsWith('lumen-player-'));
}
