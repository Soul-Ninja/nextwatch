'use client';

import { searchAnime } from '../../lib/search';
import { upcomingFor } from '../../lib/universe';
import { ReleaseCard } from '../ReleaseCard';
import { useSeed } from '../SeedProvider';
import { useViewer } from '../useViewer';

export function SearchResults({ query, builtAt }: { query: string; builtAt: string }) {
  const seed = useSeed();
  const view = useViewer(builtAt);
  const results = upcomingFor(seed, searchAnime(seed, query).map((a) => a.id), view.now);

  return (
    <section aria-labelledby="search-heading">
      <h1 id="search-heading">{query.trim() ? `Results for “${query.trim()}”` : 'Search titles'}</h1>
      <form action="/search" role="search" className="search-page">
        <label htmlFor="search-page-q">Title</label>
        <input id="search-page-q" name="q" type="search" defaultValue={query} key={query} autoComplete="off" />
        <button type="submit" className="follow">Search</button>
      </form>
      {!query.trim() ? (
        <p className="empty">Type part of a title, in any language it is listed in.</p>
      ) : results.length === 0 ? (
        <p className="empty" role="status">No titles match “{query.trim()}”.</p>
      ) : (
        <>
          <p className="meta" role="status">{results.length} {results.length === 1 ? 'title' : 'titles'} found.</p>
          <ul className="cards">
            {results.map((item) => <ReleaseCard key={item.anime.id} item={item} zone={view.zone} />)}
          </ul>
        </>
      )}
    </section>
  );
}
