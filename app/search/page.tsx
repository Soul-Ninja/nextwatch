import type { Metadata } from 'next';
import { SearchResults } from './SearchResults';

export const metadata: Metadata = { title: 'Search · Nextwatch' };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

// Rendered per request so results are in the HTML and search works without JavaScript.
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = ((Array.isArray(q) ? q[0] : q) ?? '').slice(0, 100); // bound user input
  return (
    <main>
      <SearchResults query={query} builtAt={new Date().toISOString()} />
    </main>
  );
}
