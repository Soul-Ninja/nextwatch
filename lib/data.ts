import { cache } from 'react';
import { seed as fictionalSeed } from './seed';
import { fetchTmdbSeed, fetchTmdbTitle, searchTmdb, tmdbIdentity, type CatalogSearch } from './tmdb';
import { searchAnime } from './search';
import type { Seed } from './types';

/**
 * The data every page renders: live TMDB data when TMDB_TOKEN is set (server only, never sent to browsers),
 * otherwise the labelled fictional sample. Cached per request; TMDB responses are cached for 6 hours.
 */
export const loadSeed = cache(async (): Promise<Seed> => {
  const token = process.env.TMDB_TOKEN;
  if (!token) return fictionalSeed;
  try {
    return await fetchTmdbSeed(token);
  } catch {
    return { fictional: false, unavailable: true, anime: [], events: [], evidence: [] };
  }
});

export async function loadSearch(query: string, page: number): Promise<CatalogSearch> {
  const token = process.env.TMDB_TOKEN;
  if (token) return searchTmdb(token, query, page);
  return { seed: { ...fictionalSeed, anime: searchAnime(fictionalSeed, query) }, page: 1, hasMore: false };
}

export const loadAnimeSeed = cache(async (slug: string): Promise<Seed | null> => {
  const token = process.env.TMDB_TOKEN;
  if (token && tmdbIdentity(slug)) return fetchTmdbTitle(token, slug);
  const seed = await loadSeed();
  if (seed.unavailable) throw new Error('TMDB is unavailable');
  return seed.anime.some((a) => a.slug === slug) ? seed : null;
});
