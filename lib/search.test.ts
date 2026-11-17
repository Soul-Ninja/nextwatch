import { describe, expect, it } from 'vitest';
import { searchAnime } from './search';
import { seed } from './seed';
import type { Seed } from './types';

const ids = (s: Seed, q: string) => searchAnime(s, q).map((a) => a.id);

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
