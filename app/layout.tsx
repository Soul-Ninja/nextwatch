import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { seed } from '../lib/seed';
import { MainNav } from './MainNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nextwatch',
  description: 'Upcoming anime broadcasts and releases in your local time.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site">
          <a href="/" className="brand">Nextwatch</a>
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
        {children}
      </body>
    </html>
  );
}
