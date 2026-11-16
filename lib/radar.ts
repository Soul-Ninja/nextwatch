import type { Anime, ReleaseEvent, Seed } from './types';

export interface RadarItem {
  event: ReleaseEvent;
  anime: Anime;
  instantUtc?: string; // absent -> the source gave a day but no time
}

export interface RadarDay {
  date: string; // YYYY-MM-DD in the viewer's timezone
  items: RadarItem[];
}

/** Calendar date (YYYY-MM-DD) of an instant in an IANA timezone. */
export function localDate(instantUtc: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(instantUtc));
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// Pure calendar arithmetic in UTC, so DST in the viewer's zone cannot skip or repeat a day.
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

const RADAR_KINDS = new Set<ReleaseEvent['kind']>(['TV_BROADCAST', 'STREAMING_RELEASE']);

/**
 * Seven viewer-local days starting today. Exact events land on the viewer's calendar day;
 * day-only events stay on the date the source gave, with no invented time.
 */
export function radarWeek(seed: Seed, timeZone: string, now: string): RadarDay[] {
  const animeById = new Map(seed.anime.map((a) => [a.id, a]));
  const today = localDate(now, timeZone);
  const days: RadarDay[] = Array.from({ length: 7 }, (_, i) => ({ date: addDays(today, i), items: [] }));
  const byDate = new Map(days.map((d) => [d.date, d]));

  for (const event of seed.events) {
    const anime = animeById.get(event.animeId);
    if (!anime || !RADAR_KINDS.has(event.kind)) continue;
    const w = event.window;
    if (w.precision === 'EXACT') byDate.get(localDate(w.instantUtc, timeZone))?.items.push({ event, anime, instantUtc: w.instantUtc });
    else if (w.precision === 'DAY') byDate.get(w.localDate)?.items.push({ event, anime });
  }

  const title = (item: RadarItem) => Object.values(item.anime.titles)[0] ?? '';
  for (const day of days) {
    // Timed events first in time order; untimed after; ties by title so simultaneous releases keep a stable order.
    day.items.sort((a, b) =>
      (a.instantUtc ?? '￿').localeCompare(b.instantUtc ?? '￿') || title(a).localeCompare(title(b)));
  }
  return days;
}
