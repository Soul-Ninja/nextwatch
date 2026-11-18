import { describe, expect, it } from 'vitest';
import { parseFollowTitles, withFollowTitles } from './follows';
import { seed } from './seed';

describe('public followed title labels', () => {
  it('retains an out-of-feed title after a storage round trip without storing release facts', () => {
    const titles = parseFollowTitles(JSON.stringify({ 'tmdb-tv-101': { title: 'Older anime', slug: 'tmdb-tv-101', events: ['untrusted'] } }));
    expect(titles).toEqual({ 'tmdb-tv-101': { title: 'Older anime', slug: 'tmdb-tv-101' } });
    const merged = withFollowTitles(seed, titles);
    expect(merged.anime.find((a) => a.id === 'tmdb-tv-101')?.titles.en).toBe('Older anime');
    expect(merged.events).toBe(seed.events);
  });
  it('ignores corrupt labels and unsafe links, and keeps current server metadata', () => {
    for (const raw of ['{broken', 'null', '[]', '{"x":{"title":"x","slug":"https://example.com"}}']) expect(parseFollowTitles(raw)).toEqual({});
    expect(withFollowTitles(seed, { [seed.anime[0]!.id]: { title: 'old', slug: 'old' } }).anime).toEqual(seed.anime);
  });
});
import { parseFollows, toggleFollow } from './follows';

describe('parseFollows', () => {
  it('returns [] for a missing value', () => expect(parseFollows(null)).toEqual([]));
  it('returns [] for invalid JSON', () => expect(parseFollows('{bad')).toEqual([]));
  it('returns [] for JSON that is not an array', () => {
    expect(parseFollows('{"a":1}')).toEqual([]);
    expect(parseFollows('"a-starfall"')).toEqual([]);
    expect(parseFollows('null')).toEqual([]);
  });
  it('drops non-strings and duplicates, keeping first-seen order', () => {
    expect(parseFollows('["b",1,"a",null,"b",{"x":1}]')).toEqual(['b', 'a']);
  });
});

describe('toggleFollow', () => {
  it('appends an absent id', () => expect(toggleFollow(['a'], 'b')).toEqual(['a', 'b']));
  it('removes a present id', () => expect(toggleFollow(['a', 'b'], 'a')).toEqual(['b']));
  it('does not mutate its input', () => {
    const ids = Object.freeze(['a']) as string[];
    expect(toggleFollow(ids, 'b')).toEqual(['a', 'b']);
    expect(ids).toEqual(['a']);
  });
});
