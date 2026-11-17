import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Horizon } from './Horizon';

export const metadata: Metadata = { title: 'Horizon · Nextwatch' };

export default function HorizonPage() {
  return (
    <main>
      {/* Suspense lets the page stay static while the format filter reads the URL in the browser. */}
      <Suspense>
        <Horizon builtAt={new Date().toISOString()} />
      </Suspense>
    </main>
  );
}
