import type { Seed } from './types';

// FICTIONAL fixture data: invented titles, studios, platforms and sources for development and tests only.
// Each event exists to cover one edge case named in its comment; keep them when editing.
export const seed: Seed = {
  fictional: true,
  anime: [
    { id: 'a-starfall', slug: 'starfall-courier', titles: { en: 'Starfall Courier' }, format: 'TV', studios: ['Studio Example'], genres: ['Sci-Fi'] },
    { id: 'a-lantern', slug: 'lantern-tide', titles: { en: 'Lantern Tide' }, format: 'TV', genres: ['Drama'] },
    { id: 'a-orchard', slug: 'glass-orchard', titles: { en: 'Glass Orchard' }, format: 'TV', genres: ['Fantasy'] },
    {
      id: 'a-orchard-2', slug: 'glass-orchard-season-2', titles: { en: 'Glass Orchard Season 2' }, format: 'TV', genres: ['Fantasy'],
      relations: [{ animeId: 'a-orchard', type: 'SEQUEL' }],
    },
    { id: 'a-paper-moon', slug: 'paper-moon-brigade-the-movie', titles: { en: 'Paper Moon Brigade: The Movie' }, format: 'MOVIE' },
    { id: 'a-kitsune', slug: 'untitled-kitsune-project', titles: { en: 'Untitled Kitsune Project' } },
  ],
  events: [
    {
      // EXACT, airs 00:15 JST on Nov 21: still Nov 20 in UTC, India and Los Angeles (day-boundary case).
      id: 'e-starfall-ep5-jp', animeId: 'a-starfall', kind: 'TV_BROADCAST', episode: 5,
      window: { precision: 'EXACT', instantUtc: '2026-11-20T15:15:00Z', timezone: 'Asia/Tokyo' },
      status: 'SCHEDULED', region: 'JP', platform: 'Example TV',
      evidenceIds: ['ev-starfall'], lastVerifiedAt: '2026-11-16T09:00:00Z', updatedAt: '2026-11-16T09:00:00Z',
    },
    {
      // DAY, region-specific streaming: confirmed for India only, no time known.
      id: 'e-starfall-ep5-in', animeId: 'a-starfall', kind: 'STREAMING_RELEASE', episode: 5,
      window: { precision: 'DAY', localDate: '2026-11-21', timezone: 'Asia/Kolkata' },
      status: 'STREAMING_CONFIRMED', region: 'IN', platform: 'Example Stream', language: 'ja',
      evidenceIds: ['ev-starfall-stream'], lastVerifiedAt: '2026-11-16T09:00:00Z', updatedAt: '2026-11-16T09:00:00Z',
    },
    {
      // Aired in Japan; there is deliberately no streaming event for this episode, so no availability claim.
      id: 'e-starfall-ep4-jp', animeId: 'a-starfall', kind: 'TV_BROADCAST', episode: 4,
      window: { precision: 'EXACT', instantUtc: '2026-11-13T15:15:00Z', timezone: 'Asia/Tokyo' },
      status: 'BROADCAST_AIRED', region: 'JP', platform: 'Example TV',
      evidenceIds: ['ev-starfall'], updatedAt: '2026-11-14T00:00:00Z',
    },
    {
      // MONTH, delayed: previous DAY window kept in history.
      id: 'e-lantern-ep1-jp', animeId: 'a-lantern', kind: 'TV_BROADCAST', episode: 1,
      window: { precision: 'MONTH', year: 2027, month: 1 },
      status: 'DELAYED', region: 'JP',
      evidenceIds: ['ev-lantern-delay'], updatedAt: '2026-11-10T03:00:00Z',
      history: [{ changedAt: '2026-11-10T03:00:00Z', previous: { precision: 'DAY', localDate: '2026-10-04', timezone: 'Asia/Tokyo' }, evidenceId: 'ev-lantern' }],
    },
    {
      // SEASON: "Fall 2027" must never show a countdown.
      id: 'e-orchard-2-jp', animeId: 'a-orchard-2', kind: 'TV_BROADCAST', episode: 1,
      window: { precision: 'SEASON', year: 2027, season: 'FALL' },
      status: 'ANNOUNCED', region: 'JP',
      evidenceIds: ['ev-orchard-2'], updatedAt: '2026-11-01T00:00:00Z',
    },
    {
      // YEAR, theatrical, Japan only.
      id: 'e-paper-moon-jp', animeId: 'a-paper-moon', kind: 'THEATRICAL_RELEASE',
      window: { precision: 'YEAR', year: 2027 },
      status: 'IN_PRODUCTION', region: 'JP',
      evidenceIds: ['ev-paper-moon'], updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      // TBA with no region: unknown scope, not worldwide.
      id: 'e-kitsune', animeId: 'a-kitsune', kind: 'ANNOUNCEMENT',
      window: { precision: 'TBA' },
      status: 'ANNOUNCED',
      evidenceIds: ['ev-kitsune'], updatedAt: '2026-09-01T00:00:00Z',
    },
  ],
  evidence: [
    { id: 'ev-starfall', sourceName: 'Fictional official site', url: 'https://example.com/starfall/onair', claim: 'Episode broadcasts Fridays 24:15 JST on Example TV', observedAt: '2026-11-16T09:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-starfall-stream', sourceName: 'Fictional streaming press release', url: 'https://example.com/stream/starfall-india', claim: 'Streams in India the day after broadcast', observedAt: '2026-11-16T09:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-lantern', sourceName: 'Fictional official site', url: 'https://example.com/lantern/news/1', claim: 'Premieres 4 October 2026', observedAt: '2026-08-01T00:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-lantern-delay', sourceName: 'Fictional official site', url: 'https://example.com/lantern/news/2', claim: 'Premiere postponed to January 2027', observedAt: '2026-11-10T03:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-orchard-2', sourceName: 'Fictional official site', url: 'https://example.com/orchard/season-2', claim: 'Season 2 airs Fall 2027', observedAt: '2026-11-01T00:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-paper-moon', sourceName: 'Fictional distributor', url: 'https://example.com/paper-moon', claim: 'Film opens in Japanese cinemas in 2027', observedAt: '2026-10-20T00:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
    { id: 'ev-kitsune', sourceName: 'Fictional studio announcement', url: 'https://example.com/kitsune', claim: 'New project announced, no date', observedAt: '2026-09-01T00:00:00Z', confidence: 'UNVERIFIED', rightsStatus: 'PENDING' },
  ],
};
