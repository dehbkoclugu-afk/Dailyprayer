import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROTECTED_SCRIPTURE_UI = [
  'app/read.tsx',
  'src/components/VerseActionSheet.tsx',
];

const forbiddenCopy = /\b(?:summari[sz]e|simplif(?:y|ication)|rewrit(?:e|ing)|paraphras(?:e|ing)|automatic(?:ally)?[ -]?translat(?:e|ion))\b/i;
const forbiddenKey = /['"](?:verse|read)\.(?:summary|summari[sz]e|simplify|rewrite|paraphrase|translate)['"]/i;

export function findForbiddenScriptureUi(content, filename = 'surface') {
  const findings = [];
  if (forbiddenCopy.test(content)) findings.push(`${filename}: prohibited Scripture transformation copy`);
  if (forbiddenKey.test(content)) findings.push(`${filename}: prohibited Scripture transformation action key`);
  return findings;
}

export function verifyScriptureUiIntegrity(root = ROOT) {
  const findings = [];
  for (const relative of PROTECTED_SCRIPTURE_UI) {
    const filename = path.join(root, relative);
    if (!existsSync(filename)) {
      findings.push(`${relative}: protected surface is missing`);
      continue;
    }
    findings.push(...findForbiddenScriptureUi(readFileSync(filename, 'utf8'), relative));
  }

  const translations = path.join(root, 'src/i18n/translations.ts');
  if (!existsSync(translations)) findings.push('src/i18n/translations.ts: translation registry is missing');
  else findings.push(...findForbiddenScriptureUi(readFileSync(translations, 'utf8'), 'src/i18n/translations.ts'));

  if (findings.length) throw new Error(`Scripture UI integrity blocked:\n- ${findings.join('\n- ')}`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  verifyScriptureUiIntegrity();
  console.log('Verified Scripture UI exposes preservation actions only.');
}
