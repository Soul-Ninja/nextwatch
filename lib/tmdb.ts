import type { Anime, EventStatus, ReleaseEvent, Seed, SourceEvidence } from './types';
import { seedProblems } from './validate';

// TMDB is a general film/TV database: episode dates come without times, so events are DAY precision at best.
const API = 'https://api.themoviedb.org/3';
const ANIMATION = 16;
const REVALIDATE_SECONDS = 6 * 3600; // TMDB allows caching for at most 6 months
// shortcut: theatrical dates are kept for these countries only (Japan first, then likely audiences); widen when real users ask.
export const MOVIE_REGIONS = ['JP', 'IN', 'US'];

// ---- Response shapes (only the fields we read). Everything is checked at runtime: TMDB is an external source.
interface TvSummary { id: number; name: string; original_name: string; first_air_date?: string }
interface TvDetails extends TvSummary {
  status?: string;
  production_companies?: Array<{ name: string }>;
  networks?: Array<{ name: string; origin_country?: string }>;
  next_episode_to_air?: { air_date?: string; episode_number?: number; season_number?: number } | null;
  seasons?: Array<{ season_number: number; air_date?: string }>;
}
interface MovieSummary { id: number; title: string; original_title: string; release_date?: string }
interface ReleaseDates { results: Array<{ iso_3166_1: string; release_dates: Array<{ release_date: string; type: number }> }> }

const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const nonEmpty = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const positiveId = (id: unknown): id is number => Number.isSafeInteger(id) && (id as number) > 0;

// Japanese-language animation is the same scope as the discovery feed, not an exhaustive definition of anime.
function isAnime(value: unknown): value is Record<string, unknown> {
  return record(value) && value.adult !== true && value.original_language === 'ja' &&
    (Array.isArray(value.genre_ids) ? value.genre_ids.includes(ANIMATION)
      : Array.isArray(value.genres) && value.genres.some((g: unknown) => record(g) && g.id === ANIMATION));
}

export function tmdbIdentity(id: string): { kind: 'tv' | 'movie'; id: number } | null {
  const match = /^tmdb-(tv|movie)-([1-9]\d{0,9})$/.exec(id);
  return match && positiveId(Number(match[2])) ? { kind: match[1] as 'tv' | 'movie', id: Number(match[2]) } : null;
}

export interface CatalogSearch { seed: Seed; page: number; hasMore: boolean; incomplete?: boolean }

/** Search independently of discovery, then load each hit's release facts rather than guessing from its name. */
export async function searchTmdb(token: string, query: string, page = 1, fetchImpl: Fetch = fetch): Promise<CatalogSearch> {
  const q = query.trim().slice(0, 100);
  const current = Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
  const empty: Seed = { fictional: false, anime: [], events: [], evidence: [] };
  if (!q) return { seed: empty, page: current, hasMore: false };
  const responses = await Promise.all((['tv', 'movie'] as const).map(async (kind) => {
    const params = new URLSearchParams({ query: q, page: String(current), include_adult: 'false', language: 'en-US' });
    const data = await tmdbGet<unknown>(`/search/${kind}?${params}`, token, fetchImpl);
    if (!record(data) || !Array.isArray(data.results)) throw new Error('Invalid TMDB search response');
    const anime: Anime[] = [];
    for (const item of data.results) {
      if (!isAnime(item) || !positiveId(item.id)) continue;
      const name = kind === 'tv' ? item.name : item.title;
      if (!nonEmpty(name)) continue;
      const original = kind === 'tv' ? item.original_name : item.original_title;
      anime.push({ id: `tmdb-${kind}-${item.id}`, slug: `tmdb-${kind}-${item.id}`,
        titles: titles(name, nonEmpty(original) ? original : name), format: kind === 'tv' ? 'TV' : 'MOVIE' });
    }
    return { anime, hasMore: typeof data.total_pages === 'number' && current < Math.min(data.total_pages, 500) };
  }));
  const hits = [...new Map(responses.flatMap((r) => r.anime).map((a) => [a.id, a])).values()];
  const details = await inBatches(hits, 4, (a) => fetchTmdbTitle(token, a.id, new Date().toISOString(), fetchImpl));
  const seed: Seed = { ...empty,
    anime: hits.map((hit, i) => details[i]?.anime[0] ?? hit),
    events: details.flatMap((s) => s?.events ?? []), evidence: details.flatMap((s) => s?.evidence ?? []),
  };
  return { seed, page: current, hasMore: responses.some((r) => r.hasMore), incomplete: details.some((s) => !s || s.anime.length === 0) };
}

/** Resolve a public ID even when a title was not present at build time or in the upcoming selection. */
export async function fetchTmdbTitle(token: string, animeId: string, now = new Date().toISOString(), fetchImpl: Fetch = fetch): Promise<Seed | null> {
  const identity = tmdbIdentity(animeId);
  if (!identity) return null;
  let data: unknown;
  try {
    data = await tmdbGet<unknown>(`/${identity.kind}/${identity.id}?language=en-US${identity.kind === 'movie' ? '&append_to_response=release_dates' : ''}`, token, fetchImpl);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith('HTTP 404')) return null;
    throw error;
  }
  if (!record(data) || data.id !== identity.id) throw new Error('Invalid TMDB title response');
  if (!isAnime(data)) return null;
  if (!nonEmpty(identity.kind === 'tv' ? data.name : data.title)) throw new Error('Invalid TMDB title name');
  // Normalize optional fields before the existing typed mapper; malformed nested rows cannot crash it.
  const mapped = identity.kind === 'tv'
    ? mapTv({ id: identity.id, name: data.name as string, original_name: nonEmpty(data.original_name) ? data.original_name : data.name as string,
      first_air_date: isDate(data.first_air_date) ? data.first_air_date : undefined,
      status: typeof data.status === 'string' ? data.status : undefined,
      production_companies: Array.isArray(data.production_companies) ? data.production_companies.filter((c: unknown) => record(c) && nonEmpty(c.name)) as Array<{ name: string }> : [],
      networks: Array.isArray(data.networks) ? data.networks.filter((n: unknown) => record(n) && nonEmpty(n.name)) as Array<{ name: string; origin_country?: string }> : [],
      seasons: Array.isArray(data.seasons) ? data.seasons.filter((s: unknown) => record(s) && positiveId(s.season_number)) as TvDetails['seasons'] : [],
      next_episode_to_air: record(data.next_episode_to_air) ? {
        air_date: isDate(data.next_episode_to_air.air_date) ? data.next_episode_to_air.air_date : undefined,
        episode_number: positiveId(data.next_episode_to_air.episode_number) ? data.next_episode_to_air.episode_number : undefined,
        season_number: positiveId(data.next_episode_to_air.season_number) ? data.next_episode_to_air.season_number : undefined,
      } : null }, now)
    : mapMovie({ id: identity.id, title: data.title as string, original_title: nonEmpty(data.original_title) ? data.original_title : data.title as string,
      status: typeof data.status === 'string' ? data.status : undefined }, normalizeReleaseDates(data.release_dates), now);
  if (!mapped) return null;
  mapped.anime.slug = animeId;
  return dropInvalid({ fictional: false, anime: [mapped.anime], events: mapped.events, evidence: [mapped.evidence] });
}

function normalizeReleaseDates(value: unknown): ReleaseDates {
  return { results: record(value) && Array.isArray(value.results) ? value.results.flatMap((country: unknown) => {
    if (!record(country) || typeof country.iso_3166_1 !== 'string' || !Array.isArray(country.release_dates)) return [];
    return [{ iso_3166_1: country.iso_3166_1, release_dates: country.release_dates.filter((r: unknown) => record(r) && typeof r.release_date === 'string' && typeof r.type === 'number') as Array<{ release_date: string; type: number }> }];
  }) : [] };
}

function slugFor(name: string, id: number): string {
  const words = name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const short = words.length > 60 ? words.slice(0, 61).replace(/-[^-]*$/, '') : words; // cut at a word boundary
  return short ? `${short}-${id}` : `title-${id}`; // id keeps slugs unique
}

function titles(name: string, original: string): Record<string, string> {
  return original && original !== name ? { en: name, ja: original } : { en: name };
}

const TV_STATUS: Record<string, EventStatus> = { 'In Production': 'IN_PRODUCTION', Planned: 'ANNOUNCED', Pilot: 'ANNOUNCED' };
const MOVIE_STATUS: Record<string, EventStatus> = { 'In Production': 'IN_PRODUCTION', 'Post Production': 'IN_PRODUCTION', Planned: 'ANNOUNCED' };

/** One TV series -> its anime record, evidence and next known broadcast date (if any). */
export function mapTv(tv: TvDetails, now: string): { anime: Anime; events: ReleaseEvent[]; evidence: SourceEvidence } | null {
  if (!Number.isInteger(tv.id) || !nonEmpty(tv.name)) return null;
  const id = `tmdb-tv-${tv.id}`;
  const evidence: SourceEvidence = {
    id: `ev-${id}`, sourceName: 'TMDB', url: `https://www.themoviedb.org/tv/${tv.id}`,
    claim: 'Broadcast dates listed on TMDB', observedAt: now, confidence: 'SECONDARY', rightsStatus: 'APPROVED',
  };
  const anime: Anime = {
    id, slug: slugFor(tv.name, tv.id), titles: titles(tv.name, tv.original_name), format: 'TV',
    studios: tv.production_companies?.map((c) => c.name).filter(nonEmpty).slice(0, 3),
  };
  const today = now.slice(0, 10);
  const next = tv.next_episode_to_air;
  const network = tv.networks?.find((n) => n.origin_country === 'JP')?.name;
  const base = { animeId: id, kind: 'TV_BROADCAST' as const, region: 'JP', platform: network, evidenceIds: [evidence.id], lastVerifiedAt: now, updatedAt: now };
  const events: ReleaseEvent[] = [];
  const futureSeasons = (Array.isArray(tv.seasons) ? tv.seasons : [])
    .filter((s) => record(s) && positiveId(s.season_number) && isDate(s.air_date) && s.air_date >= today);
  if (next && isDate(next.air_date) && next.air_date >= today) {
    events.push({
      ...base, id: `${id}-s${next.season_number ?? 0}e${next.episode_number ?? 0}`,
      episode: Number.isInteger(next.episode_number) && next.episode_number! > 0 ? next.episode_number : undefined,
      season: positiveId(next.season_number) ? next.season_number : undefined,
      // TMDB gives the date in the broadcaster's country with no time.
      window: { precision: 'DAY', localDate: next.air_date, timezone: 'Asia/Tokyo' }, status: 'SCHEDULED',
    });
  } else if (isDate(tv.first_air_date) && tv.first_air_date >= today) {
    events.push({ ...base, id: `${id}-premiere`, episode: 1, window: { precision: 'DAY', localDate: tv.first_air_date, timezone: 'Asia/Tokyo' }, status: 'SCHEDULED' });
  } else if (futureSeasons.length === 0 && tv.status && TV_STATUS[tv.status]) {
    events.push({ ...base, id: `${id}-announced`, window: { precision: 'TBA' }, status: TV_STATUS[tv.status]! });
  }
  for (const season of futureSeasons) {
    if (events.some((e) => e.season === season.season_number || (season.season_number === 1 && e.id === `${id}-premiere`))) continue;
    events.push({ ...base, id: `${id}-s${season.season_number}-premiere`, episode: 1, season: season.season_number,
      window: { precision: 'DAY', localDate: season.air_date!, timezone: 'Asia/Tokyo' }, status: 'SCHEDULED' });
  }
  return { anime, events, evidence };
}

/** One film -> its anime record, evidence and theatrical dates in MOVIE_REGIONS. */
export function mapMovie(movie: MovieSummary & { status?: string }, dates: ReleaseDates, now: string):
  { anime: Anime; events: ReleaseEvent[]; evidence: SourceEvidence } | null {
  if (!Number.isInteger(movie.id) || !nonEmpty(movie.title)) return null;
  const id = `tmdb-movie-${movie.id}`;
  const evidence: SourceEvidence = {
    id: `ev-${id}`, sourceName: 'TMDB', url: `https://www.themoviedb.org/movie/${movie.id}`,
    claim: 'Release dates by country listed on TMDB', observedAt: now, confidence: 'SECONDARY', rightsStatus: 'APPROVED',
  };
  const anime: Anime = { id, slug: slugFor(movie.title, movie.id), titles: titles(movie.title, movie.original_title), format: 'MOVIE' };
  const today = now.slice(0, 10);
  const events: ReleaseEvent[] = [];
  for (const country of Array.isArray(dates?.results) ? dates.results : []) {
    if (!MOVIE_REGIONS.includes(country.iso_3166_1)) continue;
    // Types 2 and 3 are limited and wide theatrical releases; the time part TMDB sends is not meaningful.
    const first = (country.release_dates ?? [])
      .filter((r) => (r.type === 2 || r.type === 3) && typeof r.release_date === 'string')
      .map((r) => r.release_date.slice(0, 10)).filter(isDate).sort()[0];
    if (first && first >= today) {
      events.push({
        id: `${id}-${country.iso_3166_1.toLowerCase()}`, animeId: id, kind: 'THEATRICAL_RELEASE', region: country.iso_3166_1,
        window: { precision: 'DAY', localDate: first }, status: 'SCHEDULED', evidenceIds: [evidence.id], lastVerifiedAt: now, updatedAt: now,
      });
    }
  }
  if (events.length === 0 && movie.status && MOVIE_STATUS[movie.status]) {
    events.push({ id: `${id}-announced`, animeId: id, kind: 'ANNOUNCEMENT', window: { precision: 'TBA' }, status: MOVIE_STATUS[movie.status]!, evidenceIds: [evidence.id], lastVerifiedAt: now, updatedAt: now });
  }
  return { anime, events, evidence };
}

// ---- Fetching

type Fetch = typeof fetch;

/**
 * GET a TMDB path, waiting and retrying on dropped connections, timeouts, 429 and 5xx.
 * Throws after 3 attempts so a broken feed is loud, not silent.
 */
export async function tmdbGet<T>(path: string, token: string, fetchImpl: Fetch = fetch, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetchImpl(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: REVALIDATE_SECONDS },
      } as RequestInit);
    } catch (error) {
      if (attempt >= 3) throw new Error(`TMDB ${path} failed: ${String(error)}`);
      await sleep(1000 * attempt);
      continue;
    }
    if (res.ok) return (await res.json()) as T;
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 3) throw new Error(`TMDB ${path} failed: HTTP ${res.status}`);
    const wait = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(wait) && wait > 0 ? wait * 1000 : 1000 * attempt);
  }
}

// Requests run in small batches so one refresh (~150 calls) stays far below TMDB's ~40 per second.
// A single failed detail call drops that title (logged) instead of failing the whole refresh.
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<Array<R | null>> {
  const out: Array<R | null> = [];
  for (let i = 0; i < items.length; i += size) {
    const settled = await Promise.allSettled(items.slice(i, i + size).map(fn));
    for (const r of settled) {
      if (r.status === 'rejected') console.warn('TMDB: skipped a title:', String(r.reason));
      out.push(r.status === 'fulfilled' ? r.value : null);
    }
  }
  return out;
}

// shortcut: at most 10 pages (200 titles) per list; raise if TMDB ever lists more airing anime than that.
const MAX_DISCOVER_PAGES = 10;

const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/** Upcoming Japanese animation from TMDB as a Seed. Records that fail validation are dropped and logged. */
export async function fetchTmdbSeed(token: string, now = new Date().toISOString(), fetchImpl: Fetch = fetch): Promise<Seed> {
  const today = now.slice(0, 10);
  const common = `with_genres=${ANIMATION}&with_original_language=ja&language=en-US&include_adult=false`;
  const get = <T,>(path: string) => tmdbGet<T>(path, token, fetchImpl);

  // Every page, not just the most popular: quieter shows airing today must still reach the Radar.
  const allPages = async <T,>(path: string): Promise<T[]> => {
    const first = await get<{ results?: T[]; total_pages?: number }>(`${path}&page=1`);
    const last = Math.min(Number.isInteger(first.total_pages) ? first.total_pages! : 1, MAX_DISCOVER_PAGES);
    const rest = await Promise.all(Array.from({ length: last - 1 }, (_, i) => get<{ results?: T[] }>(`${path}&page=${i + 2}`)));
    return [first, ...rest].flatMap((r) => (Array.isArray(r.results) ? r.results : []));
  };

  const [airing, premieres, movies] = await Promise.all([
    allPages<TvSummary>(`/discover/tv?${common}&air_date.gte=${today}&air_date.lte=${addDays(today, 14)}&sort_by=popularity.desc`),
    allPages<TvSummary>(`/discover/tv?${common}&first_air_date.gte=${today}&sort_by=popularity.desc`),
    allPages<MovieSummary>(`/discover/movie?${common}&primary_release_date.gte=${today}&sort_by=popularity.desc`),
  ]);

  const tvIds = [...new Set([...airing, ...premieres].map((t) => t.id).filter(Number.isInteger))];
  const tvDetails = await inBatches(tvIds, 8, (id) => get<TvDetails>(`/tv/${id}?language=en-US`));
  const movieList = movies.filter((m) => Number.isInteger(m.id));
  const movieDates = await inBatches(movieList, 8, (m) => get<ReleaseDates>(`/movie/${m.id}/release_dates`));

  const mapped = [
    ...tvDetails.map((tv) => (tv ? mapTv(tv, now) : null)),
    ...movieList.map((m, i) => (movieDates[i] ? mapMovie(m, movieDates[i]!, now) : null)),
  ].filter((m) => m !== null);

  const seed: Seed = {
    fictional: false,
    anime: mapped.map((m) => m.anime),
    events: mapped.flatMap((m) => m.events),
    evidence: mapped.map((m) => m.evidence),
  };
  return dropInvalid(seed);
}

/** Removes anime whose records break an invariant, so one bad TMDB entry cannot take the site down. */
export function dropInvalid(seed: Seed): Seed {
  const problems = seedProblems(seed);
  if (problems.length === 0) return seed;
  const bad = new Set(problems.flatMap((p) => {
    const m = /^(?:anime|event|evidence) (tmdb-(?:tv|movie)-\d+)/.exec(p) ?? /^(?:event|evidence) (?:ev-)?(tmdb-(?:tv|movie)-\d+)/.exec(p);
    return m ? [m[1]!] : [];
  }));
  console.warn(`TMDB: dropped ${bad.size} title(s) that failed validation:`, problems.slice(0, 10));
  const keep = (id: string) => ![...bad].some((b) => id === b || id.startsWith(`${b}-`) || id === `ev-${b}`);
  const cleaned: Seed = {
    ...seed,
    anime: seed.anime.filter((a) => keep(a.id)),
    events: seed.events.filter((e) => keep(e.animeId)),
    evidence: seed.evidence.filter((e) => keep(e.id)),
  };
  const remaining = seedProblems(cleaned);
  if (remaining.length > 0) throw new Error(`TMDB data still invalid after cleanup: ${remaining.slice(0, 5).join('; ')}`);
  return cleaned;
}
