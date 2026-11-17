'use client';

import { windowLabel, whereLabel, type UniverseItem } from '../lib/universe';
import { FollowButton } from './FollowButton';

/** A title with its next release, as shown on Horizon and My Universe. */
export function ReleaseCard({ item, zone }: { item: UniverseItem; zone: string }) {
  const { anime, next, dateChanged } = item;
  const title = Object.values(anime.titles)[0] ?? anime.slug;
  return (
    <li className="card">
      <h3>{title}</h3>
      {next ? (
        <>
          <p>
            {windowLabel(next.window, zone)}
            {dateChanged && <span className="badge">Date changed</span>}
          </p>
          <p className="meta">{whereLabel(next)}</p>
        </>
      ) : (
        <p className="meta">No upcoming release known</p>
      )}
      <div><FollowButton animeId={anime.id} title={title} /></div>
    </li>
  );
}
