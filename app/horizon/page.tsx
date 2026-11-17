import type { Metadata } from 'next';
import { Horizon } from './Horizon';

export const metadata: Metadata = { title: 'Horizon · Nextwatch' };

type Props = { searchParams: Promise<{ format?: string | string[] }> };

// Rendered per request so the filtered list is in the HTML and works without JavaScript.
export default async function HorizonPage({ searchParams }: Props) {
  const { format } = await searchParams;
  return (
    <main>
      <Horizon format={Array.isArray(format) ? format[0] : format} builtAt={new Date().toISOString()} />
    </main>
  );
}
