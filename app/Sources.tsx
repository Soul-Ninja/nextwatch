'use client';

import type { ReleaseEvent } from '../lib/types';
import { useSeed } from './SeedProvider';

const shortDate = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(instant));

/** Where a release claim comes from, how sure it is, and when it was last checked. */
export function Sources({ event, zone }: { event: ReleaseEvent; zone: string }) {
  const { evidence } = useSeed();
  const sources = event.evidenceIds.flatMap((id) => evidence.find((e) => e.id === id) ?? []);
  return (
    <p className="meta">
      Source:{' '}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ', '}
          <a href={s.url} rel="noopener noreferrer">{s.sourceName === 'TMDB' ? 'Release record' : s.sourceName}</a>
          {s.confidence !== 'OFFICIAL' && ' (unverified)'}
        </span>
      ))}
      {event.lastVerifiedAt && ` · checked ${shortDate(event.lastVerifiedAt, zone)}`}
    </p>
  );
}
