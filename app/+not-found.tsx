import React from 'react';
import { router } from 'expo-router';
import { NotFoundState } from '@/components/NotFoundState';
import { useT } from '@/i18n';

/**
 * Anything the router cannot match (roadmap item 19).
 *
 * Without this file expo-router falls back to its own unmatched screen, which is
 * unstyled and English-only — a jarring thing to hand someone who followed a stale
 * link into a devotional app. This one looks like the rest of Lumen and speaks the
 * reader's language.
 */
export default function NotFoundRoute() {
  const { t: tr } = useT();
  return (
    <NotFoundState
      icon="compass-outline"
      title={tr('notFound.routeTitle')}
      body={tr('notFound.routeBody')}
      actionLabel={tr('notFound.routeAction')}
      onAction={() => router.replace('/(tabs)/today')}
    />
  );
}
