import { describe, expect, it } from 'vitest';
import { catalogResults, searchAnime } from './search';
import { seed } from './seed';
import type { Seed } from './types';

const ids = (s: Seed, q: string) => searchAnime(s, q).map((a) => a.id);

describe('upcoming catalog results', () => {
  const now = '2026-11-17T06:00:00Z';
  it('puts a dated release and an undated announcement ahead of older catalog records', () => {
    const results = catalogResults(seed, now);
    expect(results.at(-1)?.anime.id).toBe('a-orchard');
    expect(results.findIndex((r) => r.anime.id === 'a-kitsune')).toBeLessThan(results.findIndex((r) => r.anime.id === 'a-orchard'));
    expect(results[0]?.anime.id).toBe('a-starfall');
  });
  it('filters known upcoming events while keeping TBA followable and never inventing an event', () => {
    const results = catalogResults(seed, now, true);
    expect(results.some((r) => r.anime.id === 'a-orchard')).toBe(false);
    expect(results.find((r) => r.anime.id === 'a-kitsune')?.next?.window).toEqual({ precision: 'TBA' });
  });
});

describe('searchAnime', () => {
  it('matches case-insensitively in seed order', () => {
    expect(ids(seed, 'ORCHARD')).toEqual(['a-orchard', 'a-orchard-2']);
  });
  it('requires every word', () => {
    expect(ids(seed, 'orchard 2')).toEqual(['a-orchard-2']);
    expect(ids(seed, 'orchard movie')).toEqual([]);
  });
  it('ignores accents and checks every title language', () => {
    const s: Seed = { ...seed, anime: [{ id: 'p', slug: 'p', titles: { en: 'Pokémon', ja: 'ポケモン' } }] };
    expect(ids(s, 'pokemon')).toEqual(['p']);
    expect(ids(s, 'ポケモン')).toEqual(['p']);
  });
  it('returns nothing for a blank query', () => {
    expect(ids(seed, '   ')).toEqual([]);
  });
});
