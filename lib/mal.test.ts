import { describe, expect, it, vi } from 'vitest';
import { fetchMalShows, matchShow, parseMalNode, slotInstant, withBroadcastTimes, type MalShow } from './mal';
import type { Seed } from './types';
import { seedProblems } from './validate';

// Hand-written payloads shaped like MAL API v2 responses; not real MAL content.
const node = (over: object = {}) => ({
  id: 5, title: 'Reigai Senshi', media_type: 'tv',
  alternative_titles: { en: 'Example Warriors', ja: '例外戦士', synonyms: ['ReiSen'] },
  broadcast: { day_of_the_week: 'saturday', start_time: '01:28' }, ...over,
});
const show = (over: Partial<MalShow> = {}): MalShow => ({ id: 5, titles: ['Reigai Senshi', 'Example Warriors', '例外戦士'], day: 'saturday', time: '01:28', ...over });

describe('parseMalNode', () => {
  it('keeps titles and the weekly slot', () => {
    expect(parseMalNode(node())).toEqual({ id: 5, titles: ['Reigai Senshi', 'Example Warriors', '例外戦士', 'ReiSen'], day: 'saturday', time: '01:28' });
  });
  it('rejects films, missing or malformed slots and bad ids', () => {
    expect(parseMalNode(node({ media_type: 'movie' }))).toBeNull();
    expect(parseMalNode(node({ broadcast: undefined }))).toBeNull();
    expect(parseMalNode(node({ broadcast: { day_of_the_week: 'other', start_time: '01:28' } }))).toBeNull();
    expect(parseMalNode(node({ broadcast: { day_of_the_week: 'saturday', start_time: '25:30' } }))).toBeNull();
    expect(parseMalNode(node({ id: -1 }))).toBeNull();
    expect(parseMalNode('nonsense')).toBeNull();
  });
});

describe('slotInstant', () => {
  it('converts a Japan slot on the same weekday to UTC', () => {
    expect(slotInstant('2026-11-21', { day: 'saturday', time: '22:00' })).toBe('2026-11-21T13:00:00Z'); // Sat 22:00 JST
  });
  it('moves a late-night slot listed under the previous evening to the next day', () => {
    expect(slotInstant('2026-11-20', { day: 'saturday', time: '01:28' })).toBe('2026-11-20T16:28:00Z'); // Sat 01:28 JST
  });
  it('refuses a slot on any other weekday instead of guessing', () => {
    expect(slotInstant('2026-11-20', { day: 'monday', time: '22:00' })).toBeNull();
    expect(slotInstant('2026-11-20', { day: 'saturday', time: '20:00' })).toBeNull(); // next day but not late-night
  });
});

describe('matchShow', () => {
  it('matches exactly across case, width and punctuation in any listed language', () => {
    expect(matchShow(['EXAMPLE warriors!'], [show()])?.id).toBe(5);
    expect(matchShow(['例外戦士'], [show()])?.id).toBe(5);
  });
  it('returns nothing for no match or more than one match', () => {
    expect(matchShow(['Something Else'], [show()])).toBeNull();
    expect(matchShow(['Example Warriors'], [show(), show({ id: 6 })])).toBeNull();
  });
});

describe('withBroadcastTimes', () => {
  const NOW = '2026-11-18T00:00:00Z';
  const base: Seed = {
    fictional: false,
    anime: [
      { id: 'tmdb-tv-1', slug: 'example-warriors-1', titles: { en: 'Example Warriors', ja: '例外戦士' }, format: 'TV' },
      { id: 'tmdb-tv-2', slug: 'unknown-show-2', titles: { en: 'Unknown Show' }, format: 'TV' },
    ],
    events: [
      { id: 'tmdb-tv-1-s1e7', animeId: 'tmdb-tv-1', kind: 'TV_BROADCAST', episode: 7, region: 'JP', status: 'SCHEDULED',
        window: { precision: 'DAY', localDate: '2026-11-20', timezone: 'Asia/Tokyo' }, evidenceIds: ['ev-tmdb-tv-1'], updatedAt: NOW },
      { id: 'tmdb-tv-2-s1e3', animeId: 'tmdb-tv-2', kind: 'TV_BROADCAST', episode: 3, region: 'JP', status: 'SCHEDULED',
        window: { precision: 'DAY', localDate: '2026-11-20', timezone: 'Asia/Tokyo' }, evidenceIds: ['ev-tmdb-tv-2'], updatedAt: NOW },
    ],
    evidence: ['ev-tmdb-tv-1', 'ev-tmdb-tv-2'].map((id) => ({
      id, sourceName: 'TMDB', url: 'https://www.themoviedb.org/tv/1', claim: 'x', observedAt: NOW, confidence: 'SECONDARY' as const, rightsStatus: 'APPROVED' as const,
    })),
  };

  it('gives a matched show an expected time with MAL evidence and leaves the rest untouched', () => {
    const seed = withBroadcastTimes(base, [show()], NOW);
    expect(seed.events[0]).toMatchObject({
      window: { precision: 'EXACT', instantUtc: '2026-11-20T16:28:00Z', timezone: 'Asia/Tokyo' }, expectedTime: true,
      evidenceIds: ['ev-tmdb-tv-1', 'ev-mal-5'],
    });
    expect(seed.events[1]).toEqual(base.events[1]);
    expect(seed.evidence.find((e) => e.id === 'ev-mal-5')).toMatchObject({ sourceName: 'MyAnimeList', claim: 'Weekly broadcast slot: Saturdays 01:28 JST' });
    expect(seedProblems(seed)).toEqual([]);
  });

  it('changes nothing when the weekday does not fit', () => {
    expect(withBroadcastTimes(base, [show({ day: 'tuesday', time: '23:00' })], NOW).events).toEqual(base.events);
  });
});

describe('fetchMalShows', () => {
  it('sends the client id header, asks for airing and two seasons, and merges duplicates', async () => {
    const urls: string[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      urls.push(url);
      expect((init.headers as Record<string, string>)['X-MAL-CLIENT-ID']).toBe('client-123');
      return new Response(JSON.stringify({ data: [{ node: node() }, { node: node({ id: 9, broadcast: null }) }] }));
    });
    const shows = await fetchMalShows('client-123', '2026-11-18T00:00:00Z', fetchImpl as unknown as typeof fetch);
    expect(shows.map((s) => s.id)).toEqual([5]);
    expect(urls.map((u) => new URL(u).pathname)).toEqual(['/v2/anime/ranking', '/v2/anime/season/2026/fall', '/v2/anime/season/2027/winter']);
  });
});
