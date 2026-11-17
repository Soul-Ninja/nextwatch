'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Seed } from '../lib/types';

const SeedContext = createContext<Seed | null>(null);

/** Hands the server-loaded data to client components. */
export function SeedProvider({ seed, children }: { seed: Seed; children: ReactNode }) {
  return <SeedContext value={seed}>{children}</SeedContext>;
}

export function useSeed(): Seed {
  const seed = useContext(SeedContext);
  if (!seed) throw new Error('useSeed must be used inside <SeedProvider>');
  return seed;
}
