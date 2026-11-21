'use client';

import Link from 'next/link';
import { useState } from 'react';
import { localDate, radarWeek, type RadarItem } from '../lib/radar';
import { STATUS_LABEL, titleOf, whereLabel } from '../lib/universe';
import { FollowButton } from './FollowButton';
import { useSeed } from './SeedProvider';
import { Sources } from './Sources';
import { useViewer } from './useViewer';

// Date-only strings are formatted in UTC so the label never shifts by a day.
const dayLabel = (date: string, style: 'long' | 'short') => {
  const d = new Date(`${date}T00:00Z`);
  if (style === 'long') return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(d);
  return `${new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(d)} ${d.getUTCDate()}`; // "Fri 20": fits a phone row
};

const timeLabel = (instant: string, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(instant));

// A day-only date belongs to the source's zone (e.g. Japan), which can be a day off from the viewer's.
const untimedLabel = ({ event }: RadarItem) => {
  const zone = event.window.precision === 'DAY' ? event.window.timezone : undefined;
  return zone ? `${zone.split('/').pop()!.replace(/_/g, ' ')} date, time not announced` : 'Time not announced';
};

function Row({ item, zone }: { item: RadarItem; zone: string }) {
  const { event, anime } = item;
  const title = titleOf(anime);
  return (
    <li className="row">
      <p className="time">
        {item.instantUtc ? <><time dateTime={item.instantUtc}>{timeLabel(item.instantUtc, zone)}</time>{item.event.expectedTime && <span className="meta"> expected</span>}</> : untimedLabel(item)}
      </p>
      <div>
        <h4>
          <Link href={`/anime/${anime.slug}`}>{title}</Link>
          {event.season !== undefined && ` · Season ${event.season}`}
          {event.episode !== undefined && ` · Episode ${event.episode}`}
        </h4>
        <p>{whereLabel(event)} · {STATUS_LABEL[event.status]}</p>
        <Sources event={event} zone={zone} />
        <FollowButton animeId={anime.id} title={title} />
      </div>
    </li>
  );
}

export function Radar({ builtAt }: { builtAt: string }) {
  const seed = useSeed(); // shortcut: all upcoming data ships to the browser so it can regroup by local day; filter server-side once it grows.
  const view = useViewer(builtAt);
  const [weekOffset, setWeekOffset] = useState(0);
  const week = radarWeek(seed, view.zone, view.now, weekOffset);
  const today = localDate(view.now, view.zone);
  const range = `${dayLabel(week[0]!.date, 'short')} – ${dayLabel(week[6]!.date, 'short')}`;

  return (
    <section aria-labelledby="radar-heading">
      <h2 id="radar-heading">{weekOffset === 0 ? 'This week’s Radar' : `Radar · ${range}`}</h2>
      <p className="zone">
        {view.local
          ? `Days and times in your timezone (${view.zone}).`
          : `Days and times in Japan time (${view.zone}). Your local times appear once the page finishes loading.`}
      </p>

      <div className="week-nav">
        <button type="button" className="follow" onClick={() => setWeekOffset((w) => w - 1)}>← Previous week</button>
        {weekOffset !== 0 && <button type="button" className="follow" onClick={() => setWeekOffset(0)}>This week</button>}
        <button type="button" className="follow" onClick={() => setWeekOffset((w) => w + 1)}>Next week →</button>
      </div>

      <nav aria-label="Jump to day">
        <ul className="days">
          {week.map((day) => (
            <li key={day.date}>
              <a href={`#day-${day.date}`}>
                {day.date === today ? 'Today' : dayLabel(day.date, 'short')}
                <span className="count">{day.items.length}</span>
                <span className="sr-only"> {day.items.length === 1 ? 'release' : 'releases'}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {week.map((day) => (
        <section key={day.date} id={`day-${day.date}`} className="day" aria-labelledby={`day-${day.date}-heading`}>
          <h3 id={`day-${day.date}-heading`}>{day.date === today ? 'Today · ' : ''}{dayLabel(day.date, 'long')}</h3>
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
