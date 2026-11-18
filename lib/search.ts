import type { Anime, Seed } from './types';
import { span, upcomingFor } from './universe';

/** Known upcoming releases first, including TBA production entries; catalog matches remain reachable. */
export function catalogResults(seed: Seed, now: string, upcomingOnly = false) {
  return upcomingFor(seed, seed.anime.map((a) => a.id), now)
    .filter((item) => !upcomingOnly || item.next)
    .sort((a, b) => Number(Boolean(b.next)) - Number(Boolean(a.next)) ||
      (a.next ? span(a.next.window)?.[0] ?? '\uffff' : '\uffff').localeCompare(b.next ? span(b.next.window)?.[0] ?? '\uffff' : '\uffff'));
}

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
