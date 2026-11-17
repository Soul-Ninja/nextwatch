'use client';

import { useMemo, useSyncExternalStore } from 'react';

interface View { zone: string; now: string; local: boolean }

// shortcut: the browser clock is read once per page load, so a tab left open past midnight keeps yesterday's "today"; tick it if users report that.
let browserView: View | null = null;
const getBrowserView = () =>
  (browserView ??= { zone: Intl.DateTimeFormat().resolvedOptions().timeZone, now: new Date().toISOString(), local: true });
const subscribe = () => () => {};

/**
 * The viewer's timezone and clock. The server cannot know the zone, so pre-rendered HTML uses
 * Japan time and the build time (local: false) until the browser takes over; pages must say so.
 */
export function useViewer(builtAt: string): View {
  const serverView = useMemo(() => ({ zone: 'Asia/Tokyo', now: builtAt, local: false }), [builtAt]);
  return useSyncExternalStore(subscribe, getBrowserView, () => serverView);
}
