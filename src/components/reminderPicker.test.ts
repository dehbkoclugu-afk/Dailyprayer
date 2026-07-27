import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 17: the reminder time is chosen with a real time picker, in
 * the device's own clock convention, not three fixed options in an `Alert`.
 *
 * Source-level, because the sheet imports a native module and the screen reaches
 * `@/` aliases. The formatting itself is properly unit-tested in `src/lib/time.test.ts`.
 */

const sheet = readFileSync('src/components/ReminderTimeSheet.tsx', 'utf8');
const profile = readFileSync('app/(tabs)/profile.tsx', 'utf8');
const translations = readFileSync('src/i18n/translations.ts', 'utf8');

test('the fixed-time Alert is gone', () => {
  assert.ok(
    !/Alert\.alert\(\s*tr\('profile\.reminderTitle'\)/.test(profile),
    'the reminder must not be an Alert of preset times',
  );
  for (const preset of ["'07:30'", "'12:30'", "'21:00'"]) {
    assert.ok(
      !profile.includes(`setReminder(${preset})`),
      `Profile should not hard-code ${preset} as a reminder option`,
    );
  }
  // Their strings are gone too, so nobody wires them back by accident.
  for (const key of ['reminderMorning', 'reminderMidday', 'reminderEvening']) {
    assert.ok(!translations.includes(key), `${key} is dead and should be removed`);
  }
});

test('the row opens the picker and the picker writes any time back', () => {
  assert.match(profile, /const openReminderPicker = \(\) => setTimeSheet\(true\)/);
  assert.match(profile, /<ReminderTimeSheet/);
  assert.match(profile, /onPick=\{\(time\) => \{[\s\S]{0,120}setReminder\(time\)/);
  assert.match(profile, /onTurnOff=\{\(\) => \{[\s\S]{0,120}setReminder\(null\)/);
});

test('a native picker is used on both platforms', () => {
  assert.match(sheet, /from '@react-native-community\/datetimepicker'/);
  // Android wants the imperative system dialog; iOS renders inline.
  assert.match(sheet, /DateTimePickerAndroid\.open\(/);
  assert.match(sheet, /<DateTimePicker/);
  assert.match(sheet, /mode="time"|mode: 'time'/);
});

test('the Android dialog is told which clock the locale reads', () => {
  // iOS follows the system setting on its own; Android defaults to 12-hour unless
  // told, which would show "9:00 PM" to a reader whose device is on 24-hour.
  assert.match(sheet, /is24Hour: prefers24Hour\(\)/);
});

test('only a confirmed Android pick is committed', () => {
  const open = sheet.slice(sheet.indexOf('DateTimePickerAndroid.open('));
  assert.match(
    open,
    /if \(event\.type !== 'set' \|\| !date\) return;/,
    'dismissing the dialog must not set a reminder',
  );
});

test('the stored value stays 24-hour while the display follows the device', () => {
  assert.match(sheet, /toStoredTime\(/, 'the sheet must write the 24-hour storage format');
  assert.match(profile, /formatTime\(reminderTime\) \?\? tr\('profile\.off'\)/);
  assert.ok(
    !/\{reminderTime \?\? tr\('profile\.off'\)\}/.test(profile),
    'the row must not print the raw stored time',
  );
});

test('turn off is only offered when a reminder exists', () => {
  assert.match(sheet, /\{current \? button\(tr\('profile\.reminderOff'\), onTurnOff, 'danger'\) : null\}/);
});

test('the draft resets to the stored time each time the sheet opens', () => {
  // Otherwise a cancelled edit leaks into the next open.
  const effect = sheet.slice(sheet.indexOf('React.useEffect('), sheet.indexOf('const tap ='));
  assert.match(effect, /if \(visible\)/);
  assert.match(effect, /parseTime\(current\) \?\? parseTime\(DEFAULT_TIME\)/);
  assert.match(effect, /setDraft\(/);
  assert.match(effect, /setTyped\(/, 'the typed fallback must reset too');
  assert.match(effect, /\}, \[visible, current\]\)/);
});

test('a platform without a native picker still gets a usable control', () => {
  // The native component renders nothing off iOS/Android, which would leave a
  // sheet with a Save button and nothing to choose with.
  assert.match(sheet, /Platform\.OS === 'ios' \?/, 'iOS gets the inline spinner');
  assert.match(sheet, /<TextInput/, 'other platforms get a typed field');
  assert.match(sheet, /parseTime\(typed\) \? t\.border : t\.danger/, 'invalid input should be visible');
  // And an invalid entry must not quietly re-save the old time.
  const save = sheet.slice(sheet.indexOf('const save = ()'), sheet.indexOf('const button ='));
  assert.match(save, /if \(Platform\.OS !== 'ios' && !parseTime\(typed\)\) return;/);
});
