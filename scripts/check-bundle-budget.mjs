import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const limit = Number(process.env.LUMEN_BUNDLE_BUDGET_BYTES ?? 58_510_541); // 55.8 MiB
let total = 0;
let js = 0;
async function walk(dir) {
  for (const name of await readdir(dir)) {
    const path = resolve(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else {
      total += info.size;
      if (/\.(?:js|hbc)$/.test(name)) js += info.size;
    }
  }
}
await walk(root);
console.log(JSON.stringify({ root, jsBytes: js, totalBytes: total, budgetBytes: limit }));
if (js > limit) {
  console.error(`JS bundle budget exceeded by ${js - limit} bytes`);
  process.exit(1);
}
