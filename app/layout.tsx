import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { loadSeed } from '../lib/data';
import { CORRECTIONS_URL, SITE_URL } from '../lib/site';
import { MainNav } from './MainNav';
import { SeedProvider } from './SeedProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Nextwatch',
  description: 'Upcoming anime broadcasts and releases in your local time.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const seed = await loadSeed();
  return (
    <html lang="en">
      <body>
        <header className="site">
          <Link href="/" className="brand">Nextwatch</Link>
          <MainNav />
          {/* A plain GET form, so search works before (or without) JavaScript. */}
          <form action="/search" role="search" className="site-search">
            <label htmlFor="site-q" className="sr-only">Search titles</label>
            <input id="site-q" name="q" type="search" placeholder="Search titles" autoComplete="off" />
            <button type="submit">Search</button>
          </form>
        </header>
        {seed.fictional && (
          <p role="note" className="banner">
            Sample data: every title, time, platform and source on this site is fictional.
          </p>
        )}
        <SeedProvider seed={seed}>{children}</SeedProvider>
        <footer className="site-footer">
          <ul>
            <li><Link href="/about#method">How dates work</Link></li>
            <li><Link href="/about#data">Data sources</Link></li>
            <li><Link href="/about#privacy">Privacy</Link></li>
            <li><a href={CORRECTIONS_URL} rel="noopener noreferrer">Report a correction</a></li>
          </ul>
          {!seed.fictional && (
            <p className="meta">
              Release data from <a href="https://www.themoviedb.org" rel="noopener noreferrer">TMDB</a>. This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
            </p>
          )}
        </footer>
      </body>
    </html>
  );
}
