import type { Anime, Seed } from './types';

// Case- and accent-insensitive, so "pokemon" finds "Pokémon".
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Titles where every typed word appears in at least one of the anime's titles. */
export function searchAnime(seed: Seed, query: string): Anime[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return seed.anime.filter((a) => {
    const titles = Object.values(a.titles).map(fold);
    return words.every((w) => titles.some((t) => t.includes(w)));
  });
}
