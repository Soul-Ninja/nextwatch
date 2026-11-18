import type { Metadata } from 'next';
import { SearchResults } from './SearchResults';
import { loadSearch } from '../../lib/data';
import { SeedProvider } from '../SeedProvider';

export const metadata: Metadata = { title: 'Search · Nextwatch' };

type Props = { searchParams: Promise<{ q?: string | string[]; page?: string | string[]; view?: string | string[] }> };

// Rendered per request so results are in the HTML and search works without JavaScript.
export default async function SearchPage({ searchParams }: Props) {
  const { q, page, view } = await searchParams;
  const upcomingOnly = view === 'upcoming';
  const query = ((Array.isArray(q) ? q[0] : q) ?? '').slice(0, 100); // bound user input
  const requested = Number(Array.isArray(page) ? page[0] : page);
  const current = Number.isInteger(requested) && requested >= 1 && requested <= 500 ? requested : 1;
  let result;
  try {
    result = await loadSearch(query, current);
  } catch {
    return <main><SearchResults query={query} builtAt={new Date().toISOString()} failed page={current} upcomingOnly={upcomingOnly} /></main>;
  }
  return (
    <main>
      <SeedProvider seed={result.seed}>
        <SearchResults query={query} builtAt={new Date().toISOString()} page={result.page} hasMore={result.hasMore} upcomingOnly={upcomingOnly} incomplete={result.incomplete} />
      </SeedProvider>
    </main>
  );
}
