import { Radar } from './Radar';

export default function Home() {
  return (
    <main>
      <Radar builtAt={new Date().toISOString()} />
    </main>
  );
}
