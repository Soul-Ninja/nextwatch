'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { horizonGroups } from '../../lib/horizon';
import { seed } from '../../lib/seed';
import type { Anime } from '../../lib/types';
import { upcomingFor } from '../../lib/universe';
import { ReleaseCard } from '../ReleaseCard';
import { useViewer } from '../useViewer';

const FORMAT_LABELS: Record<NonNullable<Anime['format']>, string> = {
  TV: 'TV', MOVIE: 'Movies', OVA: 'OVA', ONA: 'ONA', SPECIAL: 'Specials',
};
// Only offer formats that exist in the data, so no filter can lead to a guaranteed empty page.
const FORMATS = [...new Set(seed.anime.flatMap((a) => a.format ?? []))];

export function Horizon({ builtAt }: { builtAt: string }) {
  const view = useViewer(builtAt);

  const param = useSearchParams().get('format');
  const format = FORMATS.find((f) => f === param); // ignore unknown values instead of showing nothing
  const items = upcomingFor(seed, seed.anime.filter((a) => !format || a.format === format).map((a) => a.id), view.now)
    .filter((i) => i.next);
  const groups = horizonGroups(items, view.now).filter((g) => g.items.length > 0);

  return (
    <section aria-labelledby="horizon-heading">
      <h1 id="horizon-heading">Horizon</h1>
      <p className="zone">
        What’s coming, grouped by when it can happen. Dates are only as exact as the source.
        {!view.local && ' Exact times are in Japan time until the page finishes loading.'}
      </p>

      <nav aria-label="Filter by format">
        <ul className="days">
          {[undefined, ...FORMATS].map((f) => (
            <li key={f ?? 'all'}>
              <Link href={f ? `/horizon?format=${f}` : '/horizon'} aria-current={f === format ? 'true' : undefined}>
                {f ? FORMAT_LABELS[f] : 'All'}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {groups.length === 0 && <p className="empty">No upcoming titles match this filter.</p>}
      {groups.map((g) => (
        <section key={g.bucket} className="day" aria-labelledby={`h-${g.bucket}`}>
          <h2 id={`h-${g.bucket}`}>{g.heading}</h2>
          <ul className="cards">
            {g.items.map((item) => <ReleaseCard key={item.anime.id} item={item} zone={view.zone} />)}
          </ul>
        </section>
      ))}
    </section>
  );
}
