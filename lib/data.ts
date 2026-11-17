import { cache } from 'react';
import { seed as fictionalSeed } from './seed';
import { fetchTmdbSeed } from './tmdb';
import type { Seed } from './types';

/**
 * The data every page renders: live TMDB data when TMDB_TOKEN is set (server only, never sent to browsers),
 * otherwise the labelled fictional sample. Cached per request; TMDB responses are cached for 6 hours.
 */
export const loadSeed = cache(async (): Promise<Seed> => {
  const token = process.env.TMDB_TOKEN;
  return token ? fetchTmdbSeed(token) : fictionalSeed;
});
