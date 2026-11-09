import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PRIVACY_POLICY } from '../src/data/legal.ts';

function inline(value) {
  return value
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^_(.+)_$/, '<em>$1</em>');
}

function render(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = false;
  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (list) html.push('</ul>');
    list = false;
  };
  for (const line of lines) {
    const value = line.trim();
    if (!value) { flushParagraph(); closeList(); continue; }
    if (value.startsWith('# ')) {
      flushParagraph(); closeList(); html.push(`<h1>${inline(value.slice(2))}</h1>`);
    } else if (value.startsWith('## ')) {
      flushParagraph(); closeList(); html.push(`<h2>${inline(value.slice(3))}</h2>`);
    } else if (value.startsWith('- ')) {
      flushParagraph();
      if (!list) { html.push('<ul>'); list = true; }
      html.push(`<li>${inline(value.slice(2))}</li>`);
    } else {
      closeList(); paragraph.push(value);
    }
  }
  flushParagraph(); closeList();
  return html.join('\n');
}

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Selaora privacy policy" />
  <title>Privacy Policy | Selaora</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #f2eee6; background: #0e1220; font-family: Inter, ui-sans-serif, system-ui, sans-serif; line-height: 1.65; }
    main { max-width: 760px; margin: 0 auto; padding: 64px 24px 80px; }
    .mark { color: #d9a441; font-size: 13px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    h1, h2 { font-family: Georgia, serif; line-height: 1.15; }
    h1 { font-size: clamp(42px, 8vw, 64px); margin: 12px 0 4px; }
    h2 { font-size: 25px; margin: 36px 0 12px; padding-top: 24px; border-top: 1px solid rgba(242,238,230,.14); }
    p, li { color: #ded9d1; }
    ul { padding-left: 21px; }
    a { color: #f5d88f; }
  </style>
</head>
<body>
  <main>
    <div class="mark">Selaora</div>
${render(PRIVACY_POLICY).split('\n').map((line) => `    ${line}`).join('\n')}
  </main>
</body>
</html>
`;

const target = resolve('docs/privacy/index.html');
if (process.argv.includes('--check')) {
  const current = await readFile(target, 'utf8');
  if (current !== page) throw new Error('Hosted privacy policy differs from src/data/legal.ts; run npm run privacy:build');
} else {
  await writeFile(target, page);
}
