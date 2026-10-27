/** In-memory AsyncStorage for node tests; `__delay` simulates slow devices. */
const store = new Map<string, string>();
let delay = 0;
const wait = () => new Promise((resolve) => setTimeout(resolve, delay));

const AsyncStorage = {
  __reset(entries: Record<string, string> = {}, latency = 0) {
    store.clear();
    for (const [key, value] of Object.entries(entries)) store.set(key, value);
    delay = latency;
  },
  __dump: () => Object.fromEntries(store),
  async getItem(key: string) {
    await wait();
    return store.has(key) ? (store.get(key) as string) : null;
  },
  async setItem(key: string, value: string) {
    await wait();
    store.set(key, value);
  },
  async removeItem(key: string) {
    await wait();
    store.delete(key);
  },
  async getAllKeys() {
    return [...store.keys()];
  },
  async multiRemove(keys: string[]) {
    for (const key of keys) store.delete(key);
  },
};

export default AsyncStorage;
