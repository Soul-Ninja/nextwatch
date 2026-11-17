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
