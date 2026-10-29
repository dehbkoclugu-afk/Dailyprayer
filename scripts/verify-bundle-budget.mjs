import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value, all[index + 1]] : null).filter(Boolean));
const root = resolve(args.get('--root') ?? 'dist');
const output = resolve(args.get('--output') ?? 'artifacts/bundle-budget.json');
const budget = JSON.parse(await readFile(new URL('../config/bundle-budget.json', import.meta.url), 'utf8'));

async function filesWithin(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesWithin(path));
    else found.push({ path, bytes: (await stat(path)).size });
  }
  return found;
}

const files = await filesWithin(root).catch(() => {
  throw new Error(`Bundle output is missing: ${root}`);
});
const bundleFiles = files.filter(({ path }) => /(?:index\.android\.bundle|\.(?:hbc|bundle|js))$/i.test(path) && !path.endsWith('.map'));
if (bundleFiles.length === 0) throw new Error(`No Android JS bundle found under ${root}`);
const bundle = bundleFiles.sort((left, right) => right.bytes - left.bytes)[0];
const assetExtensions = new Set(['.webp', '.png', '.jpg', '.jpeg', '.ttf', '.otf', '.wav', '.mp3']);
const bundlePaths = new Set(bundleFiles.map(({ path }) => path));
const assets = files.filter(({ path }) => !bundlePaths.has(path) && (
  assetExtensions.has(extname(path).toLowerCase()) || path.split(/[\\/]/).includes('assets')
));
const assetBytes = assets.reduce((sum, file) => sum + file.bytes, 0);
const largestAsset = assets.sort((left, right) => right.bytes - left.bytes)[0] ?? { path: '', bytes: 0 };

const scriptureDirectory = resolve('src/data');
const scriptureFiles = (await filesWithin(scriptureDirectory))
  .filter(({ path }) => /^bible-full\..+\.json$/.test(basename(path)));
const bundledScriptureBytes = scriptureFiles.reduce((sum, file) => sum + file.bytes, 0);
const failures = [];
if (bundle.bytes > budget.maxBundleBytes) failures.push(`bundle ${bundle.bytes} > ${budget.maxBundleBytes}`);
if (assetBytes > budget.maxAssetBytes) failures.push(`assets ${assetBytes} > ${budget.maxAssetBytes}`);
if (largestAsset.bytes > budget.maxSingleAssetBytes) failures.push(`single asset ${largestAsset.bytes} > ${budget.maxSingleAssetBytes}`);
if (bundledScriptureBytes > budget.maxBundledScriptureBytes) failures.push(`Scripture ${bundledScriptureBytes} > ${budget.maxBundledScriptureBytes}`);

const report = {
  generatedAt: new Date().toISOString(),
  root,
  budget,
  actual: {
    bundle: { path: relative(process.cwd(), bundle.path), bytes: bundle.bytes },
    assets: { count: assets.length, bytes: assetBytes },
    largestAsset: { path: relative(process.cwd(), largestAsset.path), bytes: largestAsset.bytes },
    bundledScripture: { files: scriptureFiles.length, bytes: bundledScriptureBytes },
  },
  status: failures.length ? 'failed' : 'passed',
  failures,
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.actual, null, 2));
if (failures.length) throw new Error(`Bundle budget exceeded: ${failures.join('; ')}`);
