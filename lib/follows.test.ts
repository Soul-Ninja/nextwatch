import { describe, expect, it } from 'vitest';
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
