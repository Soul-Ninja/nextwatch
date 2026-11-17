'use client';

import { useEffect, useState } from 'react';
import { radarWeek, type RadarItem } from '../lib/radar';
// shortcut: the whole seed ships to the browser so it can regroup by local day; filter server-side once the seed grows.
import { seed } from '../lib/seed';
import type { ReleaseEvent } from '../lib/types';
import { whereLabel } from '../lib/universe';
import { FollowButton } from './FollowButton';

// The server cannot know the viewer's zone, so the pre-rendered page uses Japan time and says so.
const FALLBACK_ZONE = 'Asia/Tokyo';

const evidenceById = new Map(seed.evidence.map((e) => [e.id, e]));

const STATUS: Record<ReleaseEvent['status'], string> = {
  ANNOUNCED: 'Announced',
  IN_PRODUCTION: 'In production',
  SCHEDULED: 'Scheduled',
  DELAYED: 'Delayed',
  BROADCAST_AIRING: 'On air now',
  BROADCAST_AIRED: 'Aired',
  STREAMING_CONFIRMED: 'Streaming date confirmed',
  STREAMING_AVAILABLE: 'Available to stream',
  RELEASED: 'Released',
  UNKNOWN: 'Status unknown',
};

// Date-only strings are formatted in UTC so the label never shifts by a day.
const dayLabel = (date: string, style: 'long' | 'short') => {
  const d = new Date(`${date}T00:00Z`);
  if (style === 'long') return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(d);
  return `${new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(d)} ${d.getUTCDate()}`; // "Fri 20": fits a phone row
};

const timeLabel = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(instant));

function Row({ item, zone }: { item: RadarItem; zone: string }) {
  const { event, anime } = item;
  const title = Object.values(anime.titles)[0] ?? anime.slug;
  const sources = event.evidenceIds.flatMap((id) => evidenceById.get(id) ?? []);
  return (
    <li className="row">
      <p className="time">
        {item.instantUtc ? <time dateTime={item.instantUtc}>{timeLabel(item.instantUtc, zone)}</time> : 'Time not announced'}
      </p>
      <div>
        <h3>
          {title}
          {event.episode !== undefined && ` · Episode ${event.episode}`}
        </h3>
        <p>{whereLabel(event)} · {STATUS[event.status]}</p>
        <p className="meta">
          Source:{' '}
          {sources.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ', '}
              <a href={s.url} rel="noopener noreferrer">{s.sourceName}</a>
              {s.confidence !== 'OFFICIAL' && ' (unverified)'}
            </span>
          ))}
          {event.lastVerifiedAt &&
            ` · checked ${new Intl.DateTimeFormat('en-US', { timeZone: zone, month: 'short', day: 'numeric' }).format(new Date(event.lastVerifiedAt))}`}
        </p>
        <FollowButton animeId={anime.id} title={title} />
      </div>
    </li>
  );
}

export function Radar({ builtAt }: { builtAt: string }) {
  const [view, setView] = useState({ zone: FALLBACK_ZONE, now: builtAt, local: false });

  useEffect(() => {
    setView({ zone: Intl.DateTimeFormat().resolvedOptions().timeZone, now: new Date().toISOString(), local: true });
  }, []);

  const week = radarWeek(seed, view.zone, view.now);

  return (
    <section aria-labelledby="radar-heading">
      <h1 id="radar-heading">This week’s Radar</h1>
      <p className="zone">
        {view.local
          ? `Days and times in your timezone (${view.zone}).`
          : `Days and times in Japan time (${view.zone}). Your local times appear once the page finishes loading.`}
      </p>

      <nav aria-label="Jump to day">
        <ul className="days">
          {week.map((day, i) => (
            <li key={day.date}>
              <a href={`#day-${day.date}`}>
                {i === 0 ? 'Today' : dayLabel(day.date, 'short')}
                <span className="count">{day.items.length}</span>
                <span className="sr-only"> {day.items.length === 1 ? 'release' : 'releases'}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {week.map((day, i) => (
        <section key={day.date} id={`day-${day.date}`} className="day" aria-labelledby={`day-${day.date}-heading`}>
          <h2 id={`day-${day.date}-heading`}>{i === 0 ? 'Today · ' : ''}{dayLabel(day.date, 'long')}</h2>
          {day.items.length > 0 ? (
            <ol>{day.items.map((item) => <Row key={item.event.id} item={item} zone={view.zone} />)}</ol>
          ) : (
            <p className="empty">Nothing scheduled.</p>
          )}
        </section>
      ))}
    </section>
  );
}
