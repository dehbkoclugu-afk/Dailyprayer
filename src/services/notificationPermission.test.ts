import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 16: a denied notification permission must never produce a
 * success message, and the Profile row must offer a way out.
 *
 * Source-level assertions — the service imports `expo-notifications` and the screen
 * reaches `@/` aliases, neither of which the plain Node test runner can load.
 */

const service = readFileSync('src/services/notifications.ts', 'utf8');
const profile = readFileSync('app/(tabs)/profile.tsx', 'utf8');

/** Body of the arrow function assigned to `name`, to keep assertions scoped. */
function arrowBody(source: string, name: string): string {
  const start = source.indexOf(`const ${name} = `);
  assert.notEqual(start, -1, `${name} is missing`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`could not read the body of ${name}`);
}

test('permission is three states, not a boolean', () => {
  assert.match(service, /export type PermissionState = 'granted' \| 'blocked' \| 'undetermined'/);
  // "blocked" is the state that needs different handling: the OS will not prompt
  // again, so only system settings can undo it.
  assert.match(service, /settings\.canAskAgain \? 'undetermined' : 'blocked'/);
});

test('the current state can be read without prompting', () => {
  const body = service.slice(service.indexOf('export async function getPermissionState'));
  assert.match(body, /getPermissionsAsync\(\)/);
  assert.ok(
    !body.slice(0, body.indexOf('}\n')).includes('requestPermissionsAsync'),
    'reading the state must not trigger a prompt',
  );
});

test('an unsupported platform reports blocked, never granted', () => {
  // Falling back to "granted" would reintroduce the dead success message on web.
  for (const fn of ['getPermissionState', 'requestPermissionState']) {
    const start = service.indexOf(`export async function ${fn}`);
    const body = service.slice(start, service.indexOf('\n}', start));
    assert.match(body, /catch \{[\s\S]*?return 'blocked';/, `${fn} must fail closed`);
  }
});

test('turning reminders off cancels the schedule', () => {
  // Writing prayerTime: 'none' without cancelling left notifications arriving
  // while the row said "Off".
  assert.match(service, /export async function cancelReminders/);
  assert.match(
    service,
    /cancelReminders[\s\S]*?cancelScheduledNotificationAsync\(REMINDER_ID\)[\s\S]*?cancelScheduledNotificationAsync\(STREAK_ID\)/,
    'cancelReminders must cancel both scheduled notifications',
  );

  const body = arrowBody(profile, 'setReminder');
  const offBranch = body.slice(0, body.indexOf('requestPermissionState'));
  assert.match(offBranch, /cancelReminders\(\)/, 'the off branch must cancel');
  assert.match(offBranch, /toast\.reminderOff/, 'the off branch must not claim a reminder was set');
});

test('success is only claimed after permission is granted', () => {
  const body = arrowBody(profile, 'setReminder');
  const gate = body.indexOf("state !== 'granted'");
  const success = body.indexOf('toast.reminderSet');
  assert.ok(gate !== -1, 'setReminder must check the resulting permission state');
  assert.ok(success > gate, 'the success toast must come after the permission gate');
  assert.match(
    body.slice(gate),
    /scheduleDailyReminder\(time\)[\s\S]*?toast\(translate\('toast\.reminderSet'\)\)/,
    'the reminder must actually be scheduled before success is announced',
  );
});

test('a blocked permission explains itself and offers system settings', () => {
  const body = arrowBody(profile, 'setReminder');
  const blocked = body.slice(body.indexOf("state !== 'granted'"));
  assert.match(blocked, /profile\.reminderBlockedTitle/);
  assert.match(blocked, /profile\.reminderOpenSettings/);
  assert.match(blocked, /openSystemSettings\(\)/);
  assert.match(blocked, /prayerTime: 'none'/, 'a time that cannot fire must not be stored as set');
  assert.match(service, /export async function openSystemSettings[\s\S]*?Linking\.openSettings\(\)/);
});

test('the Profile row shows the real state, not the stored time', () => {
  assert.match(profile, /const reminderBlocked = permission === 'blocked' && Boolean\(reminderTime\)/);
  assert.match(profile, /reminderBlocked\s*\?\s*tr\('profile\.reminderBlocked'\)/);
  assert.match(
    profile,
    /icon=\{reminderBlocked \? 'notifications-off-outline' : 'notifications-outline'\}/,
    'the icon should reflect the blocked state too',
  );
  // Tapping a blocked row goes to settings rather than reopening a picker that
  // cannot lead anywhere.
  assert.match(profile, /reminderBlocked\s*\?\s*\(\) => \{\s*NotificationService\.openSystemSettings\(\)/);
});

test('the row refreshes when the screen regains focus', () => {
  // Someone can leave for the system settings, allow notifications and come back.
  assert.match(profile, /useFocusEffect\(/);
  const focus = profile.slice(profile.indexOf('useFocusEffect('));
  assert.match(focus.slice(0, 400), /getPermissionState\(\)/);
});
