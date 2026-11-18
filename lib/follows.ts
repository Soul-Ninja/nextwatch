import type { Seed } from './types';

export const FOLLOWS_KEY = 'nextwatch:follows';
export const FOLLOW_TITLES_KEY = 'nextwatch:follow-titles';
export type FollowTitles = Record<string, { title: string; slug: string }>;

/** Only public title labels, never release facts; follows remain the original ID list. */
export function parseFollowTitles(raw: string | null): FollowTitles {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([id, entry]) =>
      /^[a-z0-9-]{1,100}$/.test(id) && entry && typeof entry === 'object' &&
      typeof entry.title === 'string' && entry.title.trim().length > 0 && entry.title.length <= 500 &&
      typeof entry.slug === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug) && entry.slug.length <= 150)
      .map(([id, entry]) => [id, { title: entry.title as string, slug: entry.slug as string }]));
  } catch {
    return {};
  }
}

export function withFollowTitles(seed: Seed, titles: FollowTitles): Seed {
  const known = new Set(seed.anime.map((a) => a.id));
  return { ...seed, anime: [...seed.anime, ...Object.entries(titles).filter(([id]) => !known.has(id))
    .map(([id, entry]) => ({ id, slug: entry.slug, titles: { en: entry.title } }))] };
}

/** Stored follow list -> anime ids. Anything unreadable becomes an empty list rather than an error. */
export function parseFollows(raw: string | null): string[] {
  if (raw === null) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is string => typeof v === 'string'))];
}

export function toggleFollow(ids: string[], animeId: string): string[] {
  return ids.includes(animeId) ? ids.filter((id) => id !== animeId) : [...ids, animeId];
}
