export const FOLLOWS_KEY = 'nextwatch:follows';

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
