import { describe, expect, it } from 'vitest';
import { addDays, localDate, radarWeek } from './radar';
import { seed } from './seed';
import type { Seed } from './types';

const NOW = '2026-11-16T03:00:00Z';
const ids = (week: ReturnType<typeof radarWeek>, date: string) =>
  week.find((d) => d.date === date)?.items.map((i) => i.event.id) ?? [];

describe('localDate', () => {
  it('puts 00:15 JST on the previous day for India and Los Angeles', () => {
    const instant = '2026-11-20T15:15:00Z';
    expect(localDate(instant, 'Asia/Tokyo')).toBe('2026-11-21');
    expect(localDate(instant, 'Asia/Kolkata')).toBe('2026-11-20');
    expect(localDate(instant, 'America/Los_Angeles')).toBe('2026-11-20');
  });

  it('follows DST in Los Angeles', () => {
    expect(localDate('2027-03-14T07:30:00Z', 'America/Los_Angeles')).toBe('2027-03-13'); // 23:30 PST
    expect(localDate('2027-03-14T10:30:00Z', 'America/Los_Angeles')).toBe('2027-03-14'); // 03:30 PDT
  });
});

describe('addDays', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-03-13', 1)).toBe('2027-03-14');
  });
});

describe('radarWeek', () => {
  it('returns seven consecutive viewer-local days starting today', () => {
    const week = radarWeek(seed, 'America/Los_Angeles', NOW); // still Nov 15 in LA
    expect(week.map((d) => d.date)).toEqual(
      ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21']);
  });

  it('groups the same UTC broadcast under each viewer’s own day', () => {
    expect(ids(radarWeek(seed, 'Asia/Kolkata', NOW), '2026-11-20')).toContain('e-starfall-ep5-jp');
    expect(ids(radarWeek(seed, 'Asia/Tokyo', NOW), '2026-11-21')).toContain('e-starfall-ep5-jp');
  });

  it('keeps day-only streaming on its date with no invented time', () => {
    const item = radarWeek(seed, 'Asia/Kolkata', NOW).find((d) => d.date === '2026-11-21')?.items[0];
    expect(item?.event.id).toBe('e-starfall-ep5-in');
    expect(item?.instantUtc).toBeUndefined();
  });

  it('leaves out vague windows, other kinds and events outside the week', () => {
    const all = radarWeek(seed, 'Asia/Kolkata', NOW).flatMap((d) => d.items.map((i) => i.event.id));
    expect(all.sort()).toEqual(['e-starfall-ep5-in', 'e-starfall-ep5-jp']);
  });

  it('orders timed events by time, then untimed, then by title', () => {
    const s: Seed = JSON.parse(JSON.stringify(seed));
    const base = s.events.find((e) => e.id === 'e-starfall-ep5-jp')!;
    s.events.push(
      { ...base, id: 'later', animeId: 'a-lantern', window: { precision: 'EXACT', instantUtc: '2026-11-20T16:00:00Z' } },
      { ...base, id: 'same-time', animeId: 'a-lantern', window: { precision: 'EXACT', instantUtc: '2026-11-20T15:15:00Z' } },
      { ...base, id: 'untimed', window: { precision: 'DAY', localDate: '2026-11-20' } },
    );
    expect(ids(radarWeek(s, 'Asia/Kolkata', NOW), '2026-11-20')).toEqual(['same-time', 'e-starfall-ep5-jp', 'later', 'untimed']);
  });
});
