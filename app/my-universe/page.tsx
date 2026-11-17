import type { Metadata } from 'next';
import { MyUniverse } from './MyUniverse';

export const metadata: Metadata = { title: 'My Universe · Nextwatch' };

export default function MyUniversePage() {
  return (
    <main>
      <MyUniverse />
    </main>
  );
}
