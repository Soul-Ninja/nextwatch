import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createLimiter } from '../../lib/rateLimit';
import { SearchResults } from './SearchResults';
import { loadSearch } from '../../lib/data';
import { SeedProvider } from '../SeedProvider';

export const metadata: Metadata = { title: 'Search · Nextwatch' };

// Each new search costs several TMDB requests, so one visitor gets 20 searches a minute.
const allowSearch = createLimiter(20, 60_000);

type Props = { searchParams: Promise<{ q?: string | string[]; page?: string | string[]; view?: string | string[] }> };

// Rendered per request so results are in the HTML and search works without JavaScript.
export default async function SearchPage({ searchParams }: Props) {
  const { q, page, view } = await searchParams;
  const upcomingOnly = view === 'upcoming';
  const query = ((Array.isArray(q) ? q[0] : q) ?? '').slice(0, 100); // bound user input
  const requested = Number(Array.isArray(page) ? page[0] : page);
  const current = Number.isInteger(requested) && requested >= 1 && requested <= 500 ? requested : 1;
  if (query.trim() && process.env.TMDB_TOKEN) {
    const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!allowSearch(ip)) {
      return (
        <main>
          <h1>Search</h1>
          <p role="alert">Too many searches in a short time. Please wait a minute and try again.</p>
        </main>
      );
    }
  }
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
