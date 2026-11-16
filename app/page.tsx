import { seed } from '../lib/seed';
import { Radar } from './Radar';

export default function Home() {
  return (
    <main>
      {seed.fictional && (
        <p role="note" className="banner">
          Sample data: every title, time, platform and source on this page is fictional.
        </p>
      )}
      <Radar builtAt={new Date().toISOString()} />
    </main>
  );
}
