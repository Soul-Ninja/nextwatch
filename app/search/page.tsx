import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from './SearchResults';

export const metadata: Metadata = { title: 'Search · Nextwatch' };

export default function SearchPage() {
  return (
    <main>
      <Suspense>
        <SearchResults builtAt={new Date().toISOString()} />
      </Suspense>
    </main>
  );
}
