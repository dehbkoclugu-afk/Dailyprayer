import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { msUntilNextDay } from '@/lib/dates';

const HOUR = 3_600_000;

/**
 * Current time that refreshes at local midnight, at the top of each hour (for
 * greetings) and whenever the app returns to the foreground — so day-bound
 * content never goes stale while the app sits in memory overnight.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const untilHour = HOUR - (now.getTime() % HOUR);
    const timer = setTimeout(() => setNow(new Date()), Math.min(untilHour, msUntilNextDay(now)) + 1000);
    return () => clearTimeout(timer);
  }, [now]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => subscription.remove();
  }, []);

  return now;
}
