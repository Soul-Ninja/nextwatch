'use client';

import Link from 'next/link';
import { upcomingFor } from '../../lib/universe';
import { ReleaseCard } from '../ReleaseCard';
import { useSeed } from '../SeedProvider';
import { useFollows } from '../useFollows';

function List() {
  const seed = useSeed();
  const { ids, ready } = useFollows();
  if (!ready) return <p className="empty">Loading your follows…</p>;

  // Only reached in the browser (ready is false on the server), so the viewer's zone and clock are safe to read here.
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const items = upcomingFor(seed, ids, new Date().toISOString());
  if (items.length === 0) {
    return (
      <p className="empty">
        You’re not following anything yet. <Link href="/">Find something on the Radar</Link>.
      </p>
    );
  }

  return (
    <>
      <h2 className="sr-only">Titles you follow</h2>
      <ul className="cards">
        {items.map((item) => <ReleaseCard key={item.anime.id} item={item} zone={zone} />)}
      </ul>
    </>
  );
}

export function MyUniverse() {
  return (
    <section aria-labelledby="universe-heading">
      <h1 id="universe-heading">My Universe</h1>
      <p className="zone">Follows are saved in this browser only.</p>
      <List />
    </section>
  );
}
