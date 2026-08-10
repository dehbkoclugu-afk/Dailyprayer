import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  ApplicationContentLocale,
  ApplicationContentPack,
  ApplicationContentRelease,
} from '../data/applicationContentPack.ts';
import { activateApplicationLocale } from './applicationLanguageActivation.ts';

function dependencies(options?: {
  installed?: ApplicationContentPack | null;
  loadError?: boolean;
  failInstall?: boolean;
  installedVersion?: string;
  releaseVersion?: string;
}) {
  const events: string[] = [];
  const pack = { locale: 'ar', version: options?.releaseVersion ?? '1.0.0' } as ApplicationContentPack;
  const release = { locale: 'ar', version: options?.releaseVersion ?? '1.0.0' } as ApplicationContentRelease;
  return {
    events,
    deps: {
      loadInstalled: async (_locale: ApplicationContentLocale) => {
        if (options?.loadError) throw new Error('corrupt');
        if (options?.installedVersion) {
          return { locale: 'ar', version: options.installedVersion } as ApplicationContentPack;
        }
        return options?.installed ?? null;
      },
      getRelease: (_locale: ApplicationContentLocale) => release,
      install: async (_release: ApplicationContentRelease) => {
        events.push('install');
        if (options?.failInstall) throw new Error('network');
        return pack;
      },
      register: (_pack: ApplicationContentPack) => events.push('register'),
      setLanguage: (_locale: ApplicationContentLocale) => events.push('set-language'),
    },
  };
}

test('registers a verified pack before persisting its locale', async () => {
  const { deps, events } = dependencies();
  await activateApplicationLocale('ar', deps);
  assert.deepEqual(events, ['install', 'register', 'set-language']);
});

test('uses an installed pack without downloading it again', async () => {
  const installed = { locale: 'ar', version: '1.0.0' } as ApplicationContentPack;
  const { deps, events } = dependencies({ installed });
  await activateApplicationLocale('ar', deps);
  assert.deepEqual(events, ['register', 'set-language']);
});

test('replaces an installed pack when the manifest has a newer version', async () => {
  const { deps, events } = dependencies({ installedVersion: '1.0.0', releaseVersion: '2.0.0' });
  await activateApplicationLocale('ar', deps);
  assert.deepEqual(events, ['install', 'register', 'set-language']);
});

test('recovers from a corrupt installed pack by reinstalling it', async () => {
  const { deps, events } = dependencies({ loadError: true });
  await activateApplicationLocale('ar', deps);
  assert.deepEqual(events, ['install', 'register', 'set-language']);
});

test('leaves the current language unchanged when installation fails', async () => {
  const { deps, events } = dependencies({ failInstall: true });
  await assert.rejects(() => activateApplicationLocale('ar', deps), /network/);
  assert.deepEqual(events, ['install']);
});

test('activates legacy bundled content without manifest access', async () => {
  const { deps, events } = dependencies();
  deps.getRelease = () => {
    throw new Error('manifest must not be read');
  };
  await activateApplicationLocale('tr', deps);
  assert.deepEqual(events, ['set-language']);
});
