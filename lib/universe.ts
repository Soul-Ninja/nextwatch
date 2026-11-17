import type { Anime, ReleaseEvent, ReleaseWindow, Season, Seed } from './types';

const SEASON_MONTH: Record<Season, number> = { WINTER: 1, SPRING: 4, SUMMER: 7, FALL: 10 };
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// First day of a month as YYYY-MM-DD; month 13 rolls into the next year.
export const monthStart = (year: number, month: number) =>
  `${year + Math.floor((month - 1) / 12)}-${String(((month - 1) % 12) + 1).padStart(2, '0')}-01`;

/** Sortable earliest start and exclusive end of a window (dates or instants); null for TBA. */
export function span(w: ReleaseWindow): [start: string, end: string] | null {
  switch (w.precision) {
    case 'EXACT': return [w.instantUtc, w.instantUtc];
    case 'DAY': return [w.localDate, new Date(Date.parse(`${w.localDate}T00:00Z`) + 86_400_000).toISOString().slice(0, 10)];
    case 'MONTH': return [monthStart(w.year, w.month), monthStart(w.year, w.month + 1)];
    case 'SEASON': return [monthStart(w.year, SEASON_MONTH[w.season]), monthStart(w.year, SEASON_MONTH[w.season] + 3)];
    case 'YEAR': return [`${w.year}-01-01`, `${w.year + 1}-01-01`];
    case 'TBA': return null;
  }
}

const DONE = new Set<ReleaseEvent['status']>(['RELEASED', 'BROADCAST_AIRED']);

function isUpcoming(event: ReleaseEvent, now: string): boolean {
  if (DONE.has(event.status)) return false;
  const w = event.window;
  if (w.precision === 'EXACT') return Date.parse(w.instantUtc) >= Date.parse(now);
  const s = span(w);
  return s === null || s[1] > new Date(now).toISOString().slice(0, 10); // window not yet over (UTC date)
}

export interface UniverseItem {
  anime: Anime;
  next?: ReleaseEvent;
  dateChanged: boolean;
}

/** Each followed title's soonest remaining release, by the earliest date its window allows. */
export function upcomingFor(seed: Seed, animeIds: string[], now: string): UniverseItem[] {
  const animeById = new Map(seed.anime.map((a) => [a.id, a]));
  const startOf = (e: ReleaseEvent) => span(e.window)?.[0] ?? '\uffff'; // TBA sorts last
  return animeIds.flatMap((id) => {
    const anime = animeById.get(id);
    if (!anime) return [];
    const next = seed.events
      .filter((e) => e.animeId === id && isUpcoming(e, now))
      .sort((a, b) => startOf(a).localeCompare(startOf(b)))[0];
    return [{ anime, next, dateChanged: Boolean(next?.history?.length) }];
  });
}

/** A release date at exactly the precision the source gave, never more. */
export function windowLabel(w: ReleaseWindow, timeZone: string): string {
  const utc = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(`${date}T00:00Z`));
  switch (w.precision) {
    case 'EXACT':
      return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        .format(new Date(w.instantUtc));
    case 'DAY': return `${utc(w.localDate, { weekday: 'short', month: 'short', day: 'numeric' })} (time not announced)`;
    case 'MONTH': return utc(monthStart(w.year, w.month), { month: 'long', year: 'numeric' });
    case 'SEASON': return `${w.season[0]}${w.season.slice(1).toLowerCase()} ${w.year}`;
    case 'YEAR': return String(w.year);
    case 'TBA': return 'Release date TBA';
  }
}

/** Where an event happens, without implying anything beyond its region and platform. */
export function whereLabel(event: ReleaseEvent): string {
  const country = event.region ? regionNames.of(event.region) ?? event.region : 'region unknown';
  if (event.kind === 'STREAMING_RELEASE') return `Streaming on ${event.platform ?? 'an unconfirmed platform'} in ${country}`;
  if (event.kind === 'THEATRICAL_RELEASE') return `In cinemas in ${country}`;
  if (event.kind === 'TV_BROADCAST') return `TV broadcast in ${country}${event.platform ? ` on ${event.platform}` : ''}`;
  return event.kind === 'TRAILER' ? 'Trailer' : 'Announcement';
}
