import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const MOCKS = {
  '@react-native-async-storage/async-storage': new URL('./mocks/asyncStorage.ts', import.meta.url).href,
};

function resolveSource(base) {
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (MOCKS[specifier]) return { url: MOCKS[specifier], shortCircuit: true };
  if (specifier.startsWith('@/')) {
    const base = fileURLToPath(new URL(`src/${specifier.slice(2)}`, root));
    const file = resolveSource(base);
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const base = fileURLToPath(new URL(specifier, context.parentURL));
    if (!/\.[cm]?[jt]sx?$|\.json$/.test(base)) {
      const file = resolveSource(base);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', source: `export default ${source};`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
