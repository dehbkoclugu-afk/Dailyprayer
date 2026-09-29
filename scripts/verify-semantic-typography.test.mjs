import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

test('fixed application text metrics use semantic typography roles', async () => {
  const files = [...await sourceFiles('app'), ...await sourceFiles('src')]
    .filter((path) => path !== join('src', 'theme', 'typography.ts'));
  const violations = [];

  for (const path of files) {
    const source = await readFile(path, 'utf8');
    source.split('\n').forEach((line, index) => {
      if (/\b(fontSize|lineHeight):\s*\d/.test(line)) {
        violations.push(`${path}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(violations, [], `Raw fixed text metrics found:\n${violations.join('\n')}`);
});
