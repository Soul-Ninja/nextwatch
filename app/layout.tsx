import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
        </header>
        {children}
      </body>
    </html>
  );
}
