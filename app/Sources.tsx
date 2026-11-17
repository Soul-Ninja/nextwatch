import { seed } from '../lib/seed';
import type { ReleaseEvent } from '../lib/types';

const evidenceById = new Map(seed.evidence.map((e) => [e.id, e]));
const shortDate = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(instant));

/** Where a release claim comes from, how sure it is, and when it was last checked. */
export function Sources({ event, zone }: { event: ReleaseEvent; zone: string }) {
  const sources = event.evidenceIds.flatMap((id) => evidenceById.get(id) ?? []);
  return (
    <p className="meta">
      Source:{' '}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ', '}
          <a href={s.url} rel="noopener noreferrer">{s.sourceName}</a>
          {s.confidence !== 'OFFICIAL' && ' (unverified)'}
        </span>
      ))}
      {event.lastVerifiedAt && ` · checked ${shortDate(event.lastVerifiedAt, zone)}`}
    </p>
  );
}
