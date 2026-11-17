'use client';

import { useEffect, useState } from 'react';

/**
 * The viewer's timezone and clock. The server cannot know the zone, so pre-rendered HTML uses
 * Japan time and the build time (local: false) until the browser takes over; pages must say so.
 */
export function useViewer(builtAt: string) {
  const [view, setView] = useState({ zone: 'Asia/Tokyo', now: builtAt, local: false });
  useEffect(() => {
    setView({ zone: Intl.DateTimeFormat().resolvedOptions().timeZone, now: new Date().toISOString(), local: true });
  }, []);
  return view;
}
