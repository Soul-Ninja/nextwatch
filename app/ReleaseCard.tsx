'use client';

import Link from 'next/link';
import { STATUS_LABEL, titleOf, windowLabel, whereLabel, type UniverseItem } from '../lib/universe';
import { FollowButton } from './FollowButton';
import { Sources } from './Sources';

/** A title with its next release, as shown on Horizon and My Universe. */
export function ReleaseCard({ item, zone }: { item: UniverseItem; zone: string }) {
  const { anime, next, dateChanged } = item;
  const title = titleOf(anime);
  return (
    <li className="card">
      <h3><Link href={`/anime/${anime.slug}`}>{title}</Link></h3>
      {anime.format && <p className="meta">{anime.format === 'MOVIE' ? 'Movie' : anime.format}</p>}
      {next ? (
        <>
          <p>
            {windowLabel(next.window, zone)}
            {next.season !== undefined && ` · Season ${next.season}`}
            {next.episode !== undefined && ` · Episode ${next.episode}`}
            {dateChanged && <span className="badge">Date changed</span>}
          </p>
          <p className="meta">{STATUS_LABEL[next.status]} · {whereLabel(next)}</p>
          <Sources event={next} zone={zone} />
        </>
      ) : (
        <p className="meta">No upcoming release loaded. Open the title for release details.</p>
      )}
      <div><FollowButton animeId={anime.id} title={title} /></div>
    </li>
  );
}
