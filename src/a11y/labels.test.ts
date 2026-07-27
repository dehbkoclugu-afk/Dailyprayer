import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { HIGHLIGHT_LABEL, HIGHLIGHT_ORDER } from '../theme/highlights.ts';
import { translations } from '../i18n/translations.ts';

/**
 * Guards roadmap items 23, 24 and 25: a control has to announce what it is,
 * whether it is the chosen one, why it is dimmed, and what it can do.
 *
 * The book/chapter picker was the case that prompted this. Its book rows and
 * chapter cells were bare `Pressable`s: no role, no label, and the current book
 * and chapter marked only by weight and colour. A screen reader heard "Psalms"
 * and "3" with no indication that either was selected — or, for a chapter cell,
 * which book the number belonged to.
 *
 * Three general rules, all readable from source:
 *
 *  1. An icon-only button has no text to fall back on, so it needs a label.
 *  2. A control that paints itself differently when active is conveying state
 *     visually, and must convey the same state to accessibility.
 *  3. A control that dims itself must be genuinely disabled — the dimming is a
 *     promise that pressing does nothing, and `opacity` alone does not keep it.
 *
 * Then three surfaces checked by name, where a general rule cannot see the case:
 * the picker (item 23), the controls that dim to a limit (item 24), and the verse
 * rows, whose actions were reachable only by a gesture nobody announced (item 25).
 *
 * None of them can see a label that is *wrong*, only one that is missing — the
 * wording was checked in a browser (`scripts/measure-tap-targets.mjs` renders the
 * same views) rather than here.
 */

const ROOTS = ['app', 'src'];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

interface Element {
  /** The opening tag, where the accessibility props live. */
  tag: string;
  /** Everything between the opening and closing tag. */
  children: string;
  /**
   * The control's own markup: the opening tag plus the children, minus any
   * nested Pressable. A sheet's backdrop wraps every control in the sheet, so
   * scanning its children whole would blame the wrapper for what a row inside
   * it does.
   */
  own: string;
  line: number;
}

/**
 * Where an opening tag ends. The first `>` outside a braced expression: style
 * props are arrow functions and objects, so a naive `indexOf('>')` stops inside
 * `({ pressed }) =>`.
 */
function openingTagEnd(source: string, from: number): { end: number; selfClosing: boolean } {
  let depth = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
    else if (ch === '>' && depth === 0) return { end: i, selfClosing: source[i - 1] === '/' };
  }
  return { end: -1, selfClosing: false };
}

/** Each `<Pressable>` with its own children, nesting accounted for. */
function pressables(source: string): Element[] {
  const found: Element[] = [];
  const re = /<\/?Pressable\b/g;
  const open: { start: number; bodyStart: number; nested: [number, number][] }[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    if (match[0].startsWith('</')) {
      const frame = open.pop();
      if (!frame) continue;
      const end = match.index + '</Pressable>'.length;
      const tag = source.slice(frame.start, frame.bodyStart - 1);
      const children = source.slice(frame.bodyStart, match.index);
      // Cut nested Pressables out, so a wrapper is not judged by what it wraps.
      let own = tag;
      let cursor = frame.bodyStart;
      for (const [from, to] of frame.nested) {
        own += source.slice(cursor, from);
        cursor = to;
      }
      own += source.slice(cursor, match.index);
      found.push({
        tag,
        children,
        own,
        line: source.slice(0, frame.start).split('\n').length,
      });
      open.at(-1)?.nested.push([frame.start, end]);
      continue;
    }

    const { end, selfClosing } = openingTagEnd(source, match.index);
    if (end === -1) continue;
    const tag = source.slice(match.index, end);
    if (selfClosing) {
      found.push({
        tag,
        children: '',
        own: tag,
        line: source.slice(0, match.index).split('\n').length,
      });
      open.at(-1)?.nested.push([match.index, end + 1]);
      continue;
    }
    open.push({ start: match.index, bodyStart: end + 1, nested: [] });
  }
  return found;
}

test('an icon-only button carries a label', () => {
  // With no text child there is nothing for a screen reader to read out, so the
  // control announces itself as an unnamed button.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    for (const { tag, own, line } of pressables(readFileSync(file, 'utf8'))) {
      const iconOnly = /<Ionicons\b/.test(own) && !/<Text\b/.test(own);
      if (!iconOnly) continue;
      if (!/accessibilityLabel[=\s]/.test(tag)) offenders.push(`${file}:${line}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `icon-only Pressables with no accessibilityLabel:\n${offenders.join('\n')}`,
  );
});

test('a control that looks selected also says it is selected', () => {
  // Weight, colour and a tinted background are invisible to a screen reader;
  // accessibilityState is the only channel that carries the same information.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    for (const { tag, own, line } of pressables(readFileSync(file, 'utf8'))) {
      const paintsActive = /\b(active|selected|isActive|done)\s*\?/.test(own);
      if (!paintsActive) continue;
      if (!/accessibilityState/.test(tag)) offenders.push(`${file}:${line}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Pressables that highlight an active state without announcing it:\n${offenders.join('\n')}`,
  );
});

test('a control that dims itself is really disabled', () => {
  // Dimming is a promise that pressing does nothing. RN's Pressable folds the
  // `disabled` prop into accessibilityState, so the prop is the whole job — but a
  // control that only drops its opacity keeps neither half of the promise.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    for (const { tag, line } of pressables(readFileSync(file, 'utf8'))) {
      const dims = [...tag.matchAll(/opacity:\s*([^?]+)\?/g)]
        // `pressed` is press feedback, not a disabled state.
        .filter(([, condition]) => !/\bpressed\b/.test(condition));
      if (dims.length === 0) continue;
      if (!/\bdisabled=/.test(tag) && !/accessibilityState=\{\{[^}]*disabled/.test(tag)) {
        offenders.push(`${file}:${line} opacity: ${dims[0][1].trim()} ?`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Pressables dimmed without being disabled:\n${offenders.join('\n')}`,
  );
});

test('a dimmed control says why it is dimmed', () => {
  // "Previous, button, dimmed" leaves the reader guessing. Roadmap item 24: the
  // two places that dim to a limit both branch their label on that limit.
  const reader = readFileSync(join('app', 'read.tsx'), 'utf8');
  const nav = pressables(reader).find(({ tag }) => /disabled=\{!target\}/.test(tag));
  assert.ok(nav, 'the reader’s chapter arrows');
  assert.match(nav.tag, /accessibilityLabel=\{\s*target\s*\?/, 'the label must branch on the limit');
  assert.match(nav.tag, /a11y\.atBibleStart|a11y\.atBibleEnd/);

  const settings = readFileSync(join('src', 'components', 'ReadingSettingsSheet.tsx'), 'utf8');
  const step = pressables(settings).find(({ tag }) => /disabled=\{disabled\}/.test(tag));
  assert.ok(step, 'the font-size steppers');
  assert.match(step.tag, /accessibilityLabel=\{\s*\n?\s*disabled\s*\?/);
  assert.match(step.tag, /a11y\.textAtLargest|a11y\.textAtSmallest/);

  // The player's line-back button is the third of the three, and was the same
  // defect one file over.
  const player = readFileSync(join('app', 'player.tsx'), 'utf8');
  const back = pressables(player).find(({ tag }) => /disabled=\{line === 0\}/.test(tag));
  assert.ok(back, 'the player’s previous-line button');
  assert.match(back.tag, /accessibilityLabel=\{line === 0 \?/);
  assert.match(back.tag, /a11y\.atFirstLine/);
});

test('a verse offers its actions instead of hiding them in a long press', () => {
  // Roadmap item 25. A verse row is a `Text` with onPress and onLongPress: tapping
  // opens the action sheet, long-pressing highlights, and a screen reader could
  // discover neither — TalkBack read the verse as plain text with nothing to
  // suggest it did anything at all.
  //
  // They are deliberately still Text, not buttons. Scripture is read by swiping
  // verse to verse, and hearing "button" after every verse of every chapter is
  // noise; `accessibilityActions` puts the two actions in TalkBack's actions menu,
  // which is where an occasional action on a text element belongs.
  const source = readFileSync(join('app', 'read.tsx'), 'utf8');

  const props = source.match(/const verseA11y = \{[\s\S]*?\n {10}\};/);
  assert.ok(props, 'expected a shared verse accessibility block');
  const block = props[0];

  assert.match(block, /accessibilityLabel:/, 'the verse needs a label');
  assert.match(block, /read\.verse/, 'a bare numeral runs into the first word');
  // The state has to come before the verse: a long verse takes twenty seconds to
  // read out, and a trailing "highlighted" arrives after all of it.
  const highlighted = block.match(/a11y\.highlighted'\)\}[^\n]*/);
  assert.ok(highlighted, 'the highlighted branch');
  assert.match(highlighted[0], /\$\{item\[1\]\}`$/, 'the verse text must come last');
  // And the colour is named, not the storage key (roadmap item 26).
  assert.match(block, /HIGHLIGHT_LABEL\[color\]/, 'the colour must be named');
  assert.match(block, /name: 'activate'/, 'opening the sheet must be an announced action');
  assert.match(block, /name: 'highlight'/, 'highlighting must be an announced action');
  assert.match(block, /verse\.removeHighlight/, 'the action label must follow the current state');
  assert.match(block, /onAccessibilityAction:/);

  // Both verse branches — the drop-cap first verse and the rest — must carry it.
  // The first verse renders differently and was the easy one to forget.
  const spread = [...source.matchAll(/\{\.\.\.verseA11y\}/g)];
  assert.equal(spread.length, 2, 'both the drop-cap verse and the plain verses');

  // Performing the action has to be confirmed: haptics are the only feedback a
  // sighted user needs, and a screen reader gets nothing from a tint.
  const announce = source.match(/announceForAccessibility\([\s\S]*?\);/);
  assert.ok(announce, 'highlighting must confirm itself');
  assert.match(announce[0], /verse\.highlightRemoved/);
  assert.match(announce[0], /verse\.highlightAdded/);
  // The shortcut gives no colour choice, so it says which colour it used.
  assert.match(announce[0], /HIGHLIGHT_LABEL\[QUICK_HIGHLIGHT\]/);
});

test('a highlight colour is named, never spelled from its storage key', () => {
  // Roadmap item 26. The swatch label was `${tr('verse.highlight')} ${c}`, so
  // TalkBack read the key out of the store: "Vurgula gold" — an English word in
  // five of the six languages, and jargon in the sixth.
  const names = Object.keys(HIGHLIGHT_LABEL) as (keyof typeof HIGHLIGHT_LABEL)[];
  assert.deepEqual(names, HIGHLIGHT_ORDER, 'every colour needs a name');

  // Every colour key must resolve to a real translation in all six locales; the
  // dictionary completeness test proves the rest.
  for (const colour of names) {
    assert.ok(
      HIGHLIGHT_LABEL[colour] in translations.en,
      `${HIGHLIGHT_LABEL[colour]} is not a translation key`,
    );
  }

  // No label may interpolate a bare colour variable. The old bug had a shape:
  // an accessibilityLabel template ending in the loop variable itself.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const [, expression] of source.matchAll(/accessibilityLabel=\{`([^`]*)`\}/g)) {
      // `${c}` / `${color}` straight into a label is the storage key.
      if (/\$\{c\}|\$\{colou?r\}/.test(expression)) offenders.push(`${file}: ${expression}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `raw colour keys in labels — use HIGHLIGHT_LABEL:\n${offenders.join('\n')}`,
  );
});

test('a highlight in the library says which colour it is', () => {
  // The colour stripe is the only thing telling two highlights apart in the list,
  // and it is drawn, not written.
  const source = readFileSync(join('app', 'library.tsx'), 'utf8');
  assert.match(source, /colorName: HIGHLIGHT_LABEL\[color\]/, 'the row must carry the name');
  assert.match(source, /item\.colorName\s*\n?\s*\?[\s\S]{0,120}a11y\.highlighted/);
  // "Bookmark removed" is the toast text; it was being used to name the button
  // that does the removing.
  assert.match(source, /tr\('verse\.removeBookmark'\)/);
  assert.doesNotMatch(
    source,
    /accessibilityLabel=\{item\.markKey \? tr\('verse\.removeHighlight'\) : tr\('verse\.bookmarkRemoved'\)\}/,
  );
});

test('the book and chapter picker announces purpose and selection', () => {
  // This one is named explicitly because the rules above cannot see it: the book
  // row's selected flag is written as an index comparison, and both rows carry
  // text, so neither generic rule applies.
  const source = readFileSync(join('app', 'read.tsx'), 'utf8');
  const inPicker = pressables(source).filter(({ tag }) => /setPicker\(index\)|go\(picker/.test(tag));
  assert.equal(inPicker.length, 2, 'expected the book row and the chapter cell');
  for (const { tag, line } of inPicker) {
    assert.match(tag, /accessibilityRole="button"/, `app/read.tsx:${line} needs a button role`);
    assert.match(tag, /accessibilityLabel=/, `app/read.tsx:${line} needs a label`);
    assert.match(
      tag,
      /accessibilityState=\{\{\s*selected:/,
      `app/read.tsx:${line} needs a selected state`,
    );
  }

  // A chapter cell shows a bare number, so its label has to name the book too.
  const chapterCell = inPicker.find(({ tag }) => /go\(picker/.test(tag));
  assert.ok(chapterCell);
  assert.match(chapterCell.tag, /accessibilityLabel=\{`\$\{bible\[picker\]\.name\}/);

  // The sheet's back chevron returns to the book list; "go back" would suggest
  // it closes the sheet.
  assert.match(source, /accessibilityLabel=\{tr\('a11y\.backToBooks'\)\}/);

  // TalkBack must not wander onto the reader behind the dim layer.
  assert.match(source, /accessibilityViewIsModal/);
});
