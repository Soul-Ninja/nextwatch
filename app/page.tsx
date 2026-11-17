import { Apex } from './Apex';
import { Radar } from './Radar';

export default function Home() {
  const builtAt = new Date().toISOString();
  return (
    <main>
      <h1 className="sr-only">Nextwatch: anime releases in your local time</h1>
      <Apex builtAt={builtAt} />
      <Radar builtAt={builtAt} />
    </main>
  );
}
