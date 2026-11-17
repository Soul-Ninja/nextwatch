import { describe, expect, it } from 'vitest';
import { bucketOf, horizonGroups, seasonName, seasonStart } from './horizon';
import { seed } from './seed';
import type { ReleaseWindow } from './types';
import { upcomingFor, type UniverseItem } from './universe';

const NOW = '2026-11-17T03:00:00Z'; // Fall 2026
const item = (window: ReleaseWindow): UniverseItem => ({
  anime: seed.anime[0]!,
  next: { id: 'x', animeId: 'a-starfall', kind: 'TV_BROADCAST', window, status: 'SCHEDULED', evidenceIds: [], updatedAt: NOW },
  dateChanged: false,
});

describe('seasons', () => {
  it('finds the season start and name', () => {
    expect(seasonStart('2026-11-17')).toBe('2026-10-01');
    expect(seasonStart('2027-01-01')).toBe('2027-01-01');
    expect(seasonStart('2027-06-30')).toBe('2027-04-01');
    expect(seasonName('2026-10-01')).toBe('Fall 2026');
    expect(seasonName('2027-01-01')).toBe('Winter 2027');
  });
});

describe('bucketOf', () => {
  it('places each precision honestly', () => {
    expect(bucketOf(item({ precision: 'EXACT', instantUtc: '2026-11-20T15:15:00Z' }), NOW)).toBe('THIS_SEASON');
    expect(bucketOf(item({ precision: 'EXACT', instantUtc: '2026-12-31T23:30:00Z' }), NOW)).toBe('THIS_SEASON');
    expect(bucketOf(item({ precision: 'DAY', localDate: '2027-02-10' }), NOW)).toBe('NEXT_SEASON');
    expect(bucketOf(item({ precision: 'MONTH', year: 2027, month: 1 }), NOW)).toBe('NEXT_SEASON');
    expect(bucketOf(item({ precision: 'SEASON', year: 2027, season: 'WINTER' }), NOW)).toBe('NEXT_SEASON');
    expect(bucketOf(item({ precision: 'SEASON', year: 2027, season: 'FALL' }), NOW)).toBe('LATER');
    expect(bucketOf(item({ precision: 'TBA' }), NOW)).toBe('TBA');
  });

  it('never puts a year-only release in a single season it might miss', () => {
    expect(bucketOf(item({ precision: 'YEAR', year: 2027 }), NOW)).toBe('LATER');
    expect(bucketOf(item({ precision: 'YEAR', year: 2026 }), NOW)).toBe('THIS_SEASON'); // only Fall is left
    expect(bucketOf(item({ precision: 'YEAR', year: 2026 }), '2026-05-01T00:00:00Z')).toBe('LATER');
  });

  it('treats a title with no upcoming release as TBA', () => {
    expect(bucketOf({ anime: seed.anime[0]!, dateChanged: false }, NOW)).toBe('TBA');
  });
});

describe('horizonGroups', () => {
  it('groups the fixture titles with season headings, soonest first', () => {
    const items = upcomingFor(seed, seed.anime.map((a) => a.id), NOW).filter((i) => i.next);
    const groups = horizonGroups(items, NOW);
    expect(groups.map((g) => [g.heading, g.items.map((i) => i.anime.id)])).toEqual([
      ['This season · Fall 2026', ['a-starfall']],
      ['Next season · Winter 2027', ['a-lantern']],
      ['Later', ['a-paper-moon', 'a-orchard-2']],
      ['Date not announced', ['a-kitsune']],
    ]);
  });
});
