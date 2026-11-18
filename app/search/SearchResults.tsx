'use client';

import Link from 'next/link';
import { catalogResults } from '../../lib/search';
import { ReleaseCard } from '../ReleaseCard';
import { useSeed } from '../SeedProvider';
import { useViewer } from '../useViewer';

export function SearchResults({ query, builtAt, page = 1, hasMore = false, failed = false, upcomingOnly = false, incomplete = false }: { query: string; builtAt: string; page?: number; hasMore?: boolean; failed?: boolean; upcomingOnly?: boolean; incomplete?: boolean }) {
  const seed = useSeed();
  const view = useViewer(builtAt);
  const results = catalogResults(seed, view.now, upcomingOnly);
  const pageLink = (n: number, onlyUpcoming = upcomingOnly) => `/search?${new URLSearchParams({ q: query, page: String(n), ...(onlyUpcoming ? { view: 'upcoming' } : {}) })}`;

  return (
    <section aria-labelledby="search-heading">
      <h1 id="search-heading">{query.trim() ? `Results for “${query.trim()}”` : 'Search titles'}</h1>
      <form action="/search" role="search" className="search-page">
        <label htmlFor="search-page-q">Title</label>
        <input id="search-page-q" name="q" type="search" defaultValue={query} key={query} autoComplete="off" />
        {upcomingOnly && <input type="hidden" name="view" value="upcoming" />}
        <button type="submit" className="follow">Search</button>
      </form>
      <nav aria-label="Search release filter"><ul className="days">
        <li><Link href={pageLink(1, false)} aria-current={!upcomingOnly ? 'true' : undefined}>All titles</Link></li>
        <li><Link href={pageLink(1, true)} aria-current={upcomingOnly ? 'true' : undefined}>Upcoming</Link></li>
      </ul></nav>
      {!seed.fictional && <p className="meta">Upcoming releases appear first, including titles still in production. Dates and catalog coverage may be incomplete.</p>}
      {incomplete && <p role="status">Some release details could not be loaded. Upcoming results may be incomplete. <Link href={pageLink(page)}>Retry release details</Link>.</p>}
      {failed ? (
        <p role="alert">Search is temporarily unavailable. <Link href={pageLink(page)}>Try this search again</Link>.</p>
      ) : !query.trim() ? (
        <p className="empty">Type part of a title, in any language it is listed in.</p>
      ) : results.length === 0 ? (
        <p className="empty" role="status">{upcomingOnly ? 'No upcoming releases found on this page. Check All titles or another results page.' : `No titles match “${query.trim()}”.`}</p>
      ) : (
        <>
          <p className="meta" role="status">{results.length} {results.length === 1 ? 'title' : 'titles'} found{seed.fictional ? '.' : ` on page ${page}.`}</p>
          <ul className="cards">
            {results.map((item) => <ReleaseCard key={item.anime.id} item={item} zone={view.zone} />)}
          </ul>
        </>
      )}
      {!failed && (page > 1 || hasMore) && <nav aria-label="Search pages"><ul className="days">
        {page > 1 && <li><Link href={pageLink(page - 1)}>Previous page</Link></li>}
        {hasMore && <li><Link href={pageLink(page + 1)}>Next page</Link></li>}
      </ul></nav>}
    </section>
  );
}
