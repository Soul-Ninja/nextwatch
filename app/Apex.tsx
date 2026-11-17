'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { countdown } from '../lib/countdown';
import { seed } from '../lib/seed';
import { titleOf, whereLabel, windowLabel } from '../lib/universe';
import { FollowButton } from './FollowButton';
import { useViewer } from './useViewer';

const pad = (n: number) => String(n).padStart(2, '0');

/** The editorially featured release. A countdown appears only for an exact, still-future time. */
export function Apex({ builtAt }: { builtAt: string }) {
  const view = useViewer(builtAt);
  const [now, setNow] = useState<string | null>(null); // null until the browser clock is known
  useEffect(() => {
    setNow(new Date().toISOString());
    const timer = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const event = seed.events.find((e) => e.id === seed.apexEventId);
  const anime = event && seed.anime.find((a) => a.id === event.animeId);
  if (!event || !anime) return null;
  const title = titleOf(anime);
  const exact = event.window.precision === 'EXACT' ? event.window.instantUtc : undefined;
  const left = exact && now ? countdown(exact, now) : null;

  return (
    <section className="apex" aria-labelledby="apex-heading">
      <p className="eyebrow">Featured premiere</p>
      <h2 id="apex-heading">
        <Link href={`/anime/${anime.slug}`}>{title}</Link>
        {event.episode !== undefined && ` · Episode ${event.episode}`}
      </h2>
      <p>
        {windowLabel(event.window, view.zone)} · {whereLabel(event)}
        {!view.local && exact && ' (Japan time)'}
      </p>
      {left && (
        <p className="countdown" role="timer">
          Starts in {left.days > 0 && `${left.days}d `}{pad(left.hours)}h {pad(left.minutes)}m {pad(left.seconds)}s
        </p>
      )}
      {exact && now && !left && (
        <p className="meta">The scheduled time has passed. Check the sources for where it can be watched.</p>
      )}
      <FollowButton animeId={anime.id} title={title} />
    </section>
  );
}
