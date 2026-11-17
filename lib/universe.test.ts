import { describe, expect, it } from 'vitest';
import { seed } from './seed';
import type { ReleaseEvent, Seed } from './types';
import { upcomingFor, windowLabel } from './universe';

const NOW = '2026-11-16T03:00:00Z';
const nextId = (s: Seed, animeId: string, now = NOW) => upcomingFor(s, [animeId], now)[0]?.next?.id;

function withEvent(event: Partial<ReleaseEvent> & Pick<ReleaseEvent, 'id' | 'animeId' | 'window'>): Seed {
  const s: Seed = JSON.parse(JSON.stringify(seed));
  s.events.push({ kind: 'TV_BROADCAST', status: 'SCHEDULED', evidenceIds: ['ev-kitsune'], updatedAt: NOW, ...event });
  return s;
}

describe('upcomingFor', () => {
  it('picks the soonest remaining event', () => {
    expect(nextId(seed, 'a-starfall')).toBe('e-starfall-ep5-jp');
  });

  it('excludes exact events that have passed', () => {
    expect(nextId(seed, 'a-starfall', '2026-11-20T16:00:00Z')).toBe('e-starfall-ep5-in');
  });

  it('excludes day events before today (UTC) and aired events', () => {
    expect(nextId(seed, 'a-starfall', '2026-11-22T00:00:00Z')).toBeUndefined();
  });

  it('excludes vague windows that are already over', () => {
    expect(nextId(seed, 'a-paper-moon', '2028-01-02T00:00:00Z')).toBeUndefined();
    expect(nextId(seed, 'a-paper-moon', '2027-12-31T23:00:00Z')).toBe('e-paper-moon-jp');
  });

  it('sorts a future exact event before a later year-only event', () => {
    const s = withEvent({ id: 'x', animeId: 'a-paper-moon', window: { precision: 'EXACT', instantUtc: '2026-12-05T10:00:00Z' } });
    expect(nextId(s, 'a-paper-moon')).toBe('x');
  });

  it('sorts TBA last', () => {
    const s = withEvent({ id: 'y', animeId: 'a-kitsune', window: { precision: 'YEAR', year: 2028 } });
    expect(nextId(s, 'a-kitsune')).toBe('y');
  });

  it('skips unknown ids and keeps follow order', () => {
    expect(upcomingFor(seed, ['a-kitsune', 'nope', 'a-starfall'], NOW).map((i) => i.anime.id)).toEqual(['a-kitsune', 'a-starfall']);
  });

  it('leaves next undefined for a title with no events', () => {
    expect(upcomingFor(seed, ['a-orchard'], NOW)).toEqual([{ anime: seed.anime[2], next: undefined, dateChanged: false }]);
  });

  it('flags a changed date', () => {
    expect(upcomingFor(seed, ['a-lantern', 'a-starfall'], NOW).map((i) => i.dateChanged)).toEqual([true, false]);
  });
});

describe('windowLabel', () => {
  it('shows exact times in the viewer’s zone', () => {
    const w = { precision: 'EXACT', instantUtc: '2026-11-20T15:15:00Z' } as const;
    expect(windowLabel(w, 'Asia/Kolkata')).toBe('Fri, Nov 20, 8:45 PM');
    expect(windowLabel(w, 'America/Los_Angeles')).toBe('Fri, Nov 20, 7:15 AM');
  });

  it('never adds precision the source did not give', () => {
    expect(windowLabel({ precision: 'DAY', localDate: '2026-11-21' }, 'America/Los_Angeles')).toBe('Sat, Nov 21 (time not announced)');
    expect(windowLabel({ precision: 'MONTH', year: 2027, month: 1 }, 'Asia/Kolkata')).toBe('January 2027');
    expect(windowLabel({ precision: 'SEASON', year: 2027, season: 'FALL' }, 'Asia/Kolkata')).toBe('Fall 2027');
    expect(windowLabel({ precision: 'YEAR', year: 2027 }, 'Asia/Kolkata')).toBe('2027');
    expect(windowLabel({ precision: 'TBA' }, 'Asia/Kolkata')).toBe('Release date TBA');
  });
});
