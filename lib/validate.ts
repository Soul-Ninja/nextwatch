import type { ReleaseWindow, Seed } from './types';

// Date.parse rolls 2027-02-30 over to March, so compare the round-tripped string instead.
function sameAfterRoundTrip(iso: string, length: number): boolean {
  const time = Date.parse(iso);
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, length) === iso.slice(0, length);
}

const isUtcInstant = (s: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(s) && sameAfterRoundTrip(s, 16);

const isCalendarDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && sameAfterRoundTrip(`${s}T00:00Z`, 10);

const isYear = (y: number) => Number.isInteger(y) && y >= 1900 && y <= 2100;

function isTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

function windowProblems(w: ReleaseWindow): string[] {
  switch (w.precision) {
    case 'EXACT':
      return [
        ...(isUtcInstant(w.instantUtc) ? [] : [`instantUtc "${w.instantUtc}" must be a UTC instant ending in Z`]),
        ...(w.timezone === undefined || isTimeZone(w.timezone) ? [] : [`unknown timezone "${w.timezone}"`]),
      ];
    case 'DAY':
      return [
        ...(isCalendarDate(w.localDate) ? [] : [`localDate "${w.localDate}" is not a calendar date`]),
        ...(w.timezone === undefined || isTimeZone(w.timezone) ? [] : [`unknown timezone "${w.timezone}"`]),
      ];
    case 'MONTH':
      return [
        ...(isYear(w.year) ? [] : [`bad year ${w.year}`]),
        ...(Number.isInteger(w.month) && w.month >= 1 && w.month <= 12 ? [] : [`bad month ${w.month}`]),
      ];
    case 'SEASON':
    case 'YEAR':
      return isYear(w.year) ? [] : [`bad year ${w.year}`];
    case 'TBA':
      return [];
  }
}

/** Every rule the type system cannot enforce. An empty list means the seed is publishable as data. */
export function seedProblems(seed: Seed): string[] {
  const problems: string[] = [];
  const add = (where: string, message: string) => problems.push(`${where}: ${message}`);

  for (const [name, items] of [['anime', seed.anime], ['event', seed.events], ['evidence', seed.evidence]] as const) {
    const seen = new Set<string>();
    for (const { id } of items) {
      if (seen.has(id)) add(name, `duplicate id ${id}`);
      seen.add(id);
    }
  }

  const animeIds = new Set(seed.anime.map((a) => a.id));
  const evidenceIds = new Set(seed.evidence.map((e) => e.id));
  const slugs = new Set<string>();

  for (const a of seed.anime) {
    const at = (message: string) => add(`anime ${a.id}`, message);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) at(`slug "${a.slug}" must be lowercase words joined by hyphens`);
    if (slugs.has(a.slug)) at(`duplicate slug ${a.slug}`);
    slugs.add(a.slug);
    if (Object.keys(a.titles).length === 0) at('needs at least one title');
    for (const r of a.relations ?? []) if (!animeIds.has(r.animeId)) at(`unknown related anime ${r.animeId}`);
  }

  for (const ev of seed.evidence) {
    const at = (message: string) => add(`evidence ${ev.id}`, message);
    if (!URL.canParse(ev.url) || new URL(ev.url).protocol !== 'https:') at(`url "${ev.url}" must be https`);
    if (!isUtcInstant(ev.observedAt)) at('observedAt must be a UTC instant');
  }

  for (const e of seed.events) {
    const at = (message: string) => add(`event ${e.id}`, message);
    if (!animeIds.has(e.animeId)) at(`unknown anime ${e.animeId}`);
    if (e.evidenceIds.length === 0) at('needs at least one evidence id');
    for (const id of e.evidenceIds) if (!evidenceIds.has(id)) at(`unknown evidence ${id}`);
    windowProblems(e.window).forEach(at);
    if (e.episode !== undefined && !(Number.isInteger(e.episode) && e.episode > 0)) at('episode must be a positive integer');
    if (e.region !== undefined && !/^[A-Z]{2}$/.test(e.region)) at(`region "${e.region}" must be ISO 3166-1 alpha-2`);
    if (!isUtcInstant(e.updatedAt)) at('updatedAt must be a UTC instant');
    if (e.lastVerifiedAt !== undefined && !isUtcInstant(e.lastVerifiedAt)) at('lastVerifiedAt must be a UTC instant');

    if (e.status.startsWith('BROADCAST_') && e.kind !== 'TV_BROADCAST') at(`${e.status} only applies to TV_BROADCAST`);
    if (e.status.startsWith('STREAMING_')) {
      if (e.kind !== 'STREAMING_RELEASE') at(`${e.status} only applies to STREAMING_RELEASE`);
      if (!e.region || !e.platform) at(`${e.status} needs both a region and a platform`);
    }
    if (e.status === 'SCHEDULED' && e.window.precision === 'TBA') at('SCHEDULED needs a window, not TBA');
    if (e.status === 'DELAYED' && !e.history?.length) at('DELAYED must keep the previous window in history');

    for (const h of e.history ?? []) {
      if (!isUtcInstant(h.changedAt)) at('history changedAt must be a UTC instant');
      if (!evidenceIds.has(h.evidenceId)) at(`unknown evidence ${h.evidenceId} in history`);
      windowProblems(h.previous).forEach((p) => at(`history: ${p}`));
    }
  }

  if (seed.apexEventId !== undefined && !seed.events.some((e) => e.id === seed.apexEventId)) {
    add('apex', `unknown event ${seed.apexEventId}`);
  }

  return problems;
}
