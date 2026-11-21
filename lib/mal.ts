import { getJson } from './http';
import type { Seed, SourceEvidence } from './types';

// MyAnimeList is used only for each show's weekly broadcast slot in Japan (approved with limits, see docs/DATA_SOURCES.md).
const API = 'https://api.myanimelist.net/v2';
const FIELDS = 'alternative_titles,broadcast,status,media_type';
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const SEASONS = ['winter', 'spring', 'summer', 'fall'] as const;

export interface MalShow {
  id: number;
  titles: string[];
  day: (typeof DAYS)[number];
  time: string; // HH:MM in Japan time, as MAL lists it
}

const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** One MAL list entry -> a show with a usable weekly slot, or null. MAL is an external source: everything is checked. */
export function parseMalNode(node: unknown): MalShow | null {
  if (!record(node) || !Number.isSafeInteger(node.id) || (node.id as number) <= 0 || !text(node.title)) return null;
  if (node.media_type !== undefined && node.media_type !== 'tv') return null;
  const b = node.broadcast;
  if (!record(b) || !DAYS.includes(b.day_of_the_week as MalShow['day']) || typeof b.start_time !== 'string') return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.start_time)) return null;
  const alt = record(node.alternative_titles) ? node.alternative_titles : {};
  const synonyms = Array.isArray(alt.synonyms) ? alt.synonyms.filter(text) : [];
  return {
    id: node.id as number,
    titles: [node.title, alt.en, alt.ja, ...synonyms].filter(text),
    day: b.day_of_the_week as MalShow['day'],
    time: b.start_time,
  };
}

/** Shows currently airing plus this and next season, with their weekly slots: about 3 requests per refresh. */
export async function fetchMalShows(clientId: string, now = new Date().toISOString(), fetchImpl: typeof fetch = fetch): Promise<MalShow[]> {
  const date = new Date(now);
  const seasonIndex = Math.floor(date.getUTCMonth() / 3);
  const thisSeason = `${date.getUTCFullYear()}/${SEASONS[seasonIndex]}`;
  const nextSeason = seasonIndex === 3 ? `${date.getUTCFullYear() + 1}/winter` : `${date.getUTCFullYear()}/${SEASONS[seasonIndex + 1]}`;
  const query = `limit=500&nsfw=false&fields=${FIELDS}`;
  const paths = [
    `/anime/ranking?ranking_type=airing&${query}`, // long-running shows that started in earlier seasons
    `/anime/season/${thisSeason}?${query}`,
    `/anime/season/${nextSeason}?${query}`,
  ];
  const pages = await Promise.all(paths.map((p) =>
    getJson<unknown>(`MAL ${p.split('?')[0]}`, `${API}${p}`, { 'X-MAL-CLIENT-ID': clientId }, fetchImpl)));
  const shows = new Map<number, MalShow>();
  for (const page of pages) {
    for (const item of record(page) && Array.isArray(page.data) ? page.data : []) {
      const show = parseMalNode(record(item) ? item.node : null);
      if (show) shows.set(show.id, show);
    }
  }
  return [...shows.values()];
}

// Exact comparison after folding case, width and punctuation; no fuzzy matching, so a wrong show is never paired.
const fold = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/** The single MAL show sharing a title with these titles, or null when there is none or more than one. */
export function matchShow(titles: string[], shows: MalShow[]): MalShow | null {
  const wanted = new Set(titles.map(fold).filter(Boolean));
  const hits = shows.filter((s) => s.titles.some((t) => wanted.has(fold(t))));
  return hits.length === 1 ? hits[0]! : null;
}

function offsetMinutes(timeZone: string, at: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(at).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

/**
 * The UTC instant of a weekly slot on a given Tokyo date. Japanese late-night slots (e.g. Saturday 01:28) are often
 * listed under the previous evening's date, so the slot may fall on the next day; any other weekday mismatch -> null.
 */
export function slotInstant(localDate: string, show: Pick<MalShow, 'day' | 'time'>): string | null {
  const weekday = new Date(`${localDate}T00:00Z`).getUTCDay();
  const target = DAYS.indexOf(show.day);
  const hours = Number(show.time.slice(0, 2));
  let date = localDate;
  if (target !== weekday) {
    if (target !== (weekday + 1) % 7 || hours >= 6) return null;
    date = new Date(Date.parse(`${localDate}T00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  }
  const wallClock = Date.parse(`${date}T${show.time}:00Z`);
  return new Date(wallClock - offsetMinutes('Asia/Tokyo', new Date(wallClock)) * 60_000).toISOString().replace('.000Z', 'Z');
}

/**
 * Upgrades Tokyo-date TV broadcasts to an expected time from MAL's weekly slot. Only events with a single title match
 * and a matching weekday change; everything else is left exactly as TMDB gave it.
 */
export function withBroadcastTimes(seed: Seed, shows: MalShow[], now = new Date().toISOString()): Seed {
  const evidence: SourceEvidence[] = [];
  const animeById = new Map(seed.anime.map((a) => [a.id, a]));
  const events = seed.events.map((e) => {
    const w = e.window;
    if (e.kind !== 'TV_BROADCAST' || w.precision !== 'DAY' || w.timezone !== 'Asia/Tokyo') return e;
    const anime = animeById.get(e.animeId);
    const show = anime && anime.format !== 'MOVIE' ? matchShow(Object.values(anime.titles), shows) : null;
    const instant = show && slotInstant(w.localDate, show);
    if (!show || !instant) return e;
    const id = `ev-mal-${show.id}`;
    if (!evidence.some((x) => x.id === id) && !seed.evidence.some((x) => x.id === id)) {
      const day = show.day[0]!.toUpperCase() + show.day.slice(1);
      evidence.push({
        id, sourceName: 'MyAnimeList', url: `https://myanimelist.net/anime/${show.id}`,
        claim: `Weekly broadcast slot: ${day}s ${show.time} JST`, observedAt: now, confidence: 'SECONDARY', rightsStatus: 'APPROVED',
      });
    }
    return { ...e, window: { precision: 'EXACT' as const, instantUtc: instant, timezone: 'Asia/Tokyo' }, expectedTime: true, evidenceIds: [...e.evidenceIds, id] };
  });
  return { ...seed, events, evidence: [...seed.evidence, ...evidence] };
}
