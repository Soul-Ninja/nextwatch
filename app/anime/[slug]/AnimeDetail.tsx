'use client';

import Link from 'next/link';
import type { Anime } from '../../../lib/types';
import { span, STATUS_LABEL, titleOf, whereLabel, windowLabel } from '../../../lib/universe';
import { FollowButton } from '../../FollowButton';
import { useSeed } from '../../SeedProvider';
import { Sources } from '../../Sources';
import { useViewer } from '../../useViewer';

const RELATION: Record<NonNullable<Anime['relations']>[number]['type'], [to: string, from: string]> = {
  SEQUEL: ['Sequel to', 'Has a sequel:'],
  PREQUEL: ['Prequel to', 'Has a prequel:'],
  ADAPTATION: ['Adaptation of', 'Adapted as'],
  OTHER: ['Related to', 'Related to'],
};
const shortDate = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(instant));

export function AnimeDetail({ animeId, builtAt }: { animeId: string; builtAt: string }) {
  const seed = useSeed();
  const view = useViewer(builtAt);
  const animeById = new Map(seed.anime.map((a) => [a.id, a]));
  const evidenceById = new Map(seed.evidence.map((e) => [e.id, e]));
  const anime = animeById.get(animeId);
  if (!anime) return null;
  const title = titleOf(anime);
  const facts = [anime.format, ...(anime.studios ?? []), ...(anime.genres ?? [])].filter(Boolean).join(' · ');

  // Both directions, so a prequel's page also points at its sequel.
  const relations = [
    ...(anime.relations ?? []).map((r) => [RELATION[r.type][0], animeById.get(r.animeId)] as const),
    ...seed.anime.flatMap((other) =>
      (other.relations ?? []).filter((r) => r.animeId === anime.id).map((r) => [RELATION[r.type][1], other] as const)),
  ].filter((r): r is readonly [string, Anime] => r[1] !== undefined);

  const startOf = (w: Parameters<typeof span>[0]) => span(w)?.[0] ?? '\uffff';
  const events = seed.events
    .filter((e) => e.animeId === anime.id)
    .sort((a, b) => startOf(a.window).localeCompare(startOf(b.window)));

  return (
    <article aria-labelledby="anime-heading">
      <h1 id="anime-heading">{title}</h1>
      {facts && <p className="zone">{facts}</p>}
      <FollowButton animeId={anime.id} title={title} />

      {relations.length > 0 && (
        <ul className="relations">
          {relations.map(([label, other]) => (
            <li key={`${label}-${other.id}`}>{label} <Link href={`/anime/${other.slug}`}>{titleOf(other)}</Link></li>
          ))}
        </ul>
      )}

      <section aria-labelledby="releases-heading" className="day">
        <h2 id="releases-heading">Releases</h2>
        {!view.local && <p className="meta">Exact times are in Japan time until the page finishes loading.</p>}
        {events.length === 0 ? (
          <p className="empty">No release has been announced.</p>
        ) : (
          <ul className="cards">
            {events.map((e) => (
              <li key={e.id} className="card">
                <h3>
                  {windowLabel(e.window, view.zone)}
                  {e.episode !== undefined && ` · Episode ${e.episode}`}
                </h3>
                <p>{whereLabel(e)} · {STATUS_LABEL[e.status]}</p>
                <Sources event={e} zone={view.zone} />
                {e.history && e.history.length > 0 && (
                  <div>
                    <p className="badge-line"><span className="badge">Date changed</span></p>
                    <ul className="history">
                      {e.history.map((h) => (
                        <li key={h.changedAt}>
                          Previously {windowLabel(h.previous, view.zone)}, changed {shortDate(h.changedAt, view.zone)}
                          {' '}(source: {evidenceById.get(h.evidenceId)?.sourceName ?? 'unknown'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
