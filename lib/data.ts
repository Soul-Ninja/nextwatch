import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { seed as fictionalSeed } from './seed';
import { fetchMalShows, withBroadcastTimes } from './mal';
import { fetchTmdbSeed, fetchTmdbTitle, searchTmdb, tmdbIdentity, type CatalogSearch } from './tmdb';
import { searchAnime } from './search';
import type { Seed } from './types';

/**
 * The data every page renders: live TMDB data when TMDB_TOKEN is set (server only, never sent to browsers),
 * otherwise the labelled fictional sample. Cached per request; TMDB responses are cached for 6 hours.
 */
// MAL only adds expected times; if it is missing or down, TMDB data is shown unchanged.
const malShows = cache(async () => {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) return null;
  try {
    return await fetchMalShows(clientId);
  } catch (error) {
    console.warn('MAL: broadcast times skipped:', String(error));
    return null;
  }
});
const withMal = async (seed: Seed): Promise<Seed> => {
  const shows = await malShows();
  return shows ? withBroadcastTimes(seed, shows) : seed;
};

// One fixed cache key for the whole live schedule. If a refresh throws, Next.js keeps serving the last good copy
// ("the last successfully generated data will continue to be served"), so an outage never blanks the site.
// The token is read inside, not passed in: arguments become part of the stored cache key.
const liveSeed = unstable_cache(
  async () => withMal(await fetchTmdbSeed(process.env.TMDB_TOKEN!)),
  ['live-seed-v1'],
  { revalidate: 6 * 3600 },
);

export const loadSeed = cache(async (): Promise<Seed> => {
  const token = process.env.TMDB_TOKEN;
  if (!token) return fictionalSeed;
  try {
    return await liveSeed();
  } catch (error) {
    // A production build must not ship an empty site: fail it loudly instead.
    if (process.env.NEXT_PHASE === 'phase-production-build') throw error;
    // shortcut: reached only when no good copy has ever been cached; the notice page may then stay until the next refresh.
    return { fictional: false, unavailable: true, anime: [], events: [], evidence: [] };
  }
});

export async function loadSearch(query: string, page: number): Promise<CatalogSearch> {
  const token = process.env.TMDB_TOKEN;
  if (token) {
    const result = await searchTmdb(token, query, page);
    return { ...result, seed: await withMal(result.seed) };
  }
  return { seed: { ...fictionalSeed, anime: searchAnime(fictionalSeed, query) }, page: 1, hasMore: false };
}

export const loadAnimeSeed = cache(async (slug: string): Promise<Seed | null> => {
  const token = process.env.TMDB_TOKEN;
  if (token && tmdbIdentity(slug)) {
    const seed = await fetchTmdbTitle(token, slug);
    return seed && withMal(seed);
  }
  const seed = await loadSeed();
  if (seed.unavailable) throw new Error('TMDB is unavailable');
  return seed.anime.some((a) => a.slug === slug) ? seed : null;
});
