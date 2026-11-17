'use client';

import Link from 'next/link';
import { seed } from '../lib/seed';
import { span, upcomingFor } from '../lib/universe';
import { ReleaseCard } from './ReleaseCard';
import { useFollows } from './useFollows';
import { useViewer } from './useViewer';

const PREVIEW_SIZE = 3;

/** Home-page glimpse of My Universe: the soonest followed releases, or an invitation for new visitors. */
export function UniversePreview({ builtAt }: { builtAt: string }) {
  const view = useViewer(builtAt);
  const { ids, ready } = useFollows();
  if (!ready) return null; // the browser's follow list is unknown until hydration; render nothing rather than a wrong empty state

  const startOf = (w?: Parameters<typeof span>[0]) => (w && span(w)?.[0]) || '\uffff';
  const items = upcomingFor(seed, ids, view.now).sort((a, b) => startOf(a.next?.window).localeCompare(startOf(b.next?.window)));

  return (
    <section aria-labelledby="preview-heading" className="day">
      <h2 id="preview-heading">From My Universe</h2>
      {items.length === 0 ? (
        <p className="empty">
          Follow a title and its next release shows up here. <Link href="/horizon">Browse what’s coming</Link>.
        </p>
      ) : (
        <>
          <ul className="cards">
            {items.slice(0, PREVIEW_SIZE).map((item) => <ReleaseCard key={item.anime.id} item={item} zone={view.zone} />)}
          </ul>
          <p className="more"><Link href="/my-universe">See all {items.length} in My Universe</Link></p>
        </>
      )}
    </section>
  );
}
