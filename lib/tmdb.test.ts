import { describe, expect, it, vi } from 'vitest';
import { dropInvalid, fetchTmdbSeed, mapMovie, mapTv, tmdbGet } from './tmdb';
import { seedProblems } from './validate';

// Hand-written payloads shaped like TMDB responses; not real TMDB content.
const NOW = '2026-11-17T06:00:00Z';
const tv = (over: object = {}) => ({
  id: 101, name: 'Example Series', original_name: 'イグザンプル', first_air_date: '2026-10-03', status: 'Returning Series',
  production_companies: [{ name: 'Studio A' }], networks: [{ name: 'Example TV', origin_country: 'JP' }],
  next_episode_to_air: { air_date: '2026-11-21', episode_number: 8, season_number: 1 }, ...over,
});

describe('mapTv', () => {
  it('turns the next episode into a Japan-date event with no invented time', () => {
    const m = mapTv(tv(), NOW)!;
    expect(m.anime).toMatchObject({ id: 'tmdb-tv-101', slug: 'example-series-101', titles: { en: 'Example Series', ja: 'イグザンプル' }, format: 'TV', studios: ['Studio A'] });
    expect(m.events).toEqual([expect.objectContaining({
      id: 'tmdb-tv-101-s1e8', kind: 'TV_BROADCAST', episode: 8, region: 'JP', platform: 'Example TV', status: 'SCHEDULED',
      window: { precision: 'DAY', localDate: '2026-11-21', timezone: 'Asia/Tokyo' },
    })]);
    expect(m.evidence).toMatchObject({ sourceName: 'TMDB', url: 'https://www.themoviedb.org/tv/101', confidence: 'SECONDARY' });
  });

  it('uses a future premiere date when no episode is scheduled', () => {
    const m = mapTv(tv({ next_episode_to_air: null, first_air_date: '2027-01-08' }), NOW)!;
    expect(m.events[0]).toMatchObject({ id: 'tmdb-tv-101-premiere', episode: 1, window: { precision: 'DAY', localDate: '2027-01-08' } });
  });

  it('falls back to TBA for an announced show and to nothing for an aired one', () => {
    expect(mapTv(tv({ next_episode_to_air: null, first_air_date: '', status: 'In Production' }), NOW)!.events[0])
      .toMatchObject({ window: { precision: 'TBA' }, status: 'IN_PRODUCTION' });
    expect(mapTv(tv({ next_episode_to_air: { air_date: '2026-11-01' }, first_air_date: '2026-01-01', status: 'Ended' }), NOW)!.events).toEqual([]);
  });

  it('rejects records without an id or name, and keeps slugs for non-Latin names', () => {
    expect(mapTv(tv({ name: '' }), NOW)).toBeNull();
    expect(mapTv(tv({ id: 'x' }), NOW)).toBeNull();
    expect(mapTv(tv({ name: '葬送のフリーレン' }), NOW)!.anime.slug).toBe('title-101');
    expect(mapTv(tv({ name: 'The Laid-Off Cheat-Granting Mage Enjoys a Second Lease on Life' }), NOW)!.anime.slug)
      .toBe('the-laid-off-cheat-granting-mage-enjoys-a-second-lease-on-101');
  });
});

describe('mapMovie', () => {
  const dates = { results: [
    { iso_3166_1: 'JP', release_dates: [{ release_date: '2027-03-12T00:00:00.000Z', type: 3 }, { release_date: '2027-02-01T00:00:00.000Z', type: 1 }] },
    { iso_3166_1: 'IN', release_dates: [{ release_date: '2027-04-02T00:00:00.000Z', type: 2 }] },
    { iso_3166_1: 'FR', release_dates: [{ release_date: '2027-04-09T00:00:00.000Z', type: 3 }] },
    { iso_3166_1: 'US', release_dates: [{ release_date: '2027-05-01T00:00:00.000Z', type: 4 }] },
  ] };

  it('keeps theatrical dates per country, ignoring premieres, digital and other regions', () => {
    const m = mapMovie({ id: 7, title: 'Example Film', original_title: 'Example Film' }, dates, NOW)!;
    expect(m.anime).toMatchObject({ id: 'tmdb-movie-7', titles: { en: 'Example Film' }, format: 'MOVIE' });
    expect(m.events.map((e) => [e.id, e.region, e.window])).toEqual([
      ['tmdb-movie-7-jp', 'JP', { precision: 'DAY', localDate: '2027-03-12' }],
      ['tmdb-movie-7-in', 'IN', { precision: 'DAY', localDate: '2027-04-02' }],
    ]);
  });

  it('marks a film with no dated release as announced', () => {
    const m = mapMovie({ id: 8, title: 'Later Film', original_title: 'Later Film', status: 'Post Production' }, { results: [] }, NOW)!;
    expect(m.events[0]).toMatchObject({ kind: 'ANNOUNCEMENT', window: { precision: 'TBA' }, status: 'IN_PRODUCTION' });
  });
});

describe('tmdbGet', () => {
  const response = (status: number, body: unknown = {}, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers });

  it('sends the token and retries after a 429 using Retry-After', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(response(429, {}, { 'retry-after': '2' }))
      .mockResolvedValueOnce(response(200, { ok: 1 }));
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(tmdbGet('/x', 'secret', fetchImpl, sleep)).resolves.toEqual({ ok: 1 });
    expect(sleep).toHaveBeenCalledWith(2000);
    expect(fetchImpl.mock.calls[0]![1].headers.Authorization).toBe('Bearer secret');
  });

  it('retries a dropped connection, then gives up after 3 attempts', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const flaky = vi.fn().mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(response(200, { ok: 2 }));
    await expect(tmdbGet('/x', 't', flaky, sleep)).resolves.toEqual({ ok: 2 });
    const down = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    await expect(tmdbGet('/x', 't', down, sleep)).rejects.toThrow('fetch failed');
    expect(down).toHaveBeenCalledTimes(3);
  });

  it('gives up after 3 attempts and does not retry a 401', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(tmdbGet('/x', 't', vi.fn().mockResolvedValue(response(503)), sleep)).rejects.toThrow('HTTP 503');
    expect(sleep).toHaveBeenCalledTimes(2);
    const unauthorized = vi.fn().mockResolvedValue(response(401));
    await expect(tmdbGet('/x', 't', unauthorized, sleep)).rejects.toThrow('HTTP 401');
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });
});

describe('fetchTmdbSeed', () => {
  it('builds a valid, non-fictional seed and skips a title whose details fail', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      const body =
        path === '/3/discover/tv' ? { results: [{ id: 101 }, { id: 102 }] }
        : path === '/3/discover/movie' ? { results: [{ id: 7, title: 'Example Film', original_title: 'Example Film' }] }
        : path === '/3/tv/101' ? tv()
        : path === '/3/movie/7/release_dates' ? { results: [{ iso_3166_1: 'JP', release_dates: [{ release_date: '2027-03-12T00:00:00.000Z', type: 3 }] }] }
        : null;
      return body ? new Response(JSON.stringify(body)) : new Response('{}', { status: 404 });
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const seed = await fetchTmdbSeed('t', NOW, fetchImpl as unknown as typeof fetch);
    warn.mockRestore();
    expect(seed.fictional).toBe(false);
    expect(seed.anime.map((a) => a.id)).toEqual(['tmdb-tv-101', 'tmdb-movie-7']);
    expect(seedProblems(seed)).toEqual([]);
  });
});

describe('dropInvalid', () => {
  it('removes only the title with a broken record', () => {
    const good = mapTv(tv(), NOW)!;
    const bad = mapTv(tv({ id: 102, next_episode_to_air: { air_date: '2026-11-31', episode_number: 1, season_number: 1 } }), NOW)!;
    bad.events.push({ ...good.events[0]!, id: 'tmdb-tv-102-x', animeId: 'tmdb-tv-102', window: { precision: 'DAY', localDate: '2026-02-30' } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const seed = dropInvalid({ fictional: false, anime: [good.anime, bad.anime], events: [...good.events, ...bad.events], evidence: [good.evidence, bad.evidence] });
    warn.mockRestore();
    expect(seed.anime.map((a) => a.id)).toEqual(['tmdb-tv-101']);
    expect(seedProblems(seed)).toEqual([]);
  });
});
