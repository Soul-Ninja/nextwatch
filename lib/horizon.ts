import { monthStart, span, type UniverseItem } from './universe';

export type Bucket = 'THIS_SEASON' | 'NEXT_SEASON' | 'LATER' | 'TBA';

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];

/** First day of the anime season (Jan/Apr/Jul/Oct) containing a YYYY-MM-DD date. */
export function seasonStart(date: string): string {
  const [year, month] = date.split('-').map(Number) as [number, number];
  return monthStart(year, month - ((month - 1) % 3));
}

const addSeason = (start: string) => {
  const [year, month] = start.split('-').map(Number) as [number, number];
  return monthStart(year, month + 3);
};

export const seasonName = (start: string) =>
  `${SEASONS[(Number(start.slice(5, 7)) - 1) / 3]} ${start.slice(0, 4)}`;

/**
 * A release goes in a season bucket only if its whole remaining window fits inside that season,
 * so "2027" never lands in "Winter 2027" just because January is its earliest possible date.
 */
export function bucketOf(item: UniverseItem, now: string): Bucket {
  const s = item.next && span(item.next.window);
  if (!s) return 'TBA';
  const today = new Date(now).toISOString().slice(0, 10);
  const thisStart = seasonStart(today);
  const nextStart = addSeason(thisStart);
  const startDate = s[0].slice(0, 10) > today ? s[0].slice(0, 10) : today;
  const endDate = s[0] === s[1] // exact instant: its day is the whole window
    ? new Date(Date.parse(`${startDate}T00:00Z`) + 86_400_000).toISOString().slice(0, 10)
    : s[1];
  if (endDate <= nextStart) return 'THIS_SEASON';
  if (startDate >= nextStart && endDate <= addSeason(nextStart)) return 'NEXT_SEASON';
  return 'LATER';
}

export interface HorizonGroup {
  bucket: Bucket;
  heading: string;
  items: UniverseItem[];
}

/** Titles with an upcoming release, grouped by when it can happen and sorted by earliest possible date. */
export function horizonGroups(items: UniverseItem[], now: string): HorizonGroup[] {
  const thisStart = seasonStart(new Date(now).toISOString().slice(0, 10));
  const groups: HorizonGroup[] = [
    { bucket: 'THIS_SEASON', heading: `This season · ${seasonName(thisStart)}`, items: [] },
    { bucket: 'NEXT_SEASON', heading: `Next season · ${seasonName(addSeason(thisStart))}`, items: [] },
    { bucket: 'LATER', heading: 'Later', items: [] },
    { bucket: 'TBA', heading: 'Date not announced', items: [] },
  ];
  const startOf = (i: UniverseItem) => (i.next && span(i.next.window)?.[0]) || '￿';
  const sorted = [...items].sort((a, b) => startOf(a).localeCompare(startOf(b)));
  for (const item of sorted) groups.find((g) => g.bucket === bucketOf(item, now))!.items.push(item);
  return groups;
}
