import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAnimeSeed, loadSeed } from '../../../lib/data';
import { titleOf } from '../../../lib/universe';
import { AnimeDetail } from './AnimeDetail';
import { SeedProvider } from '../../SeedProvider';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true; // search can resolve TMDB IDs that were not in the build-time selection
export const generateStaticParams = async () => (await loadSeed()).anime.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seed = await loadAnimeSeed(slug).catch(() => null);
  const anime = seed?.anime.find((a) => a.slug === slug);
  return { title: anime ? `${titleOf(anime)} · Nextwatch` : 'Nextwatch' };
}

export default async function AnimePage({ params }: Props) {
  const { slug } = await params;
  let seed;
  try {
    seed = await loadAnimeSeed(slug);
  } catch {
    return <main><h1>Release details unavailable</h1><p role="alert">Release details could not be loaded. <Link href={`/anime/${encodeURIComponent(slug)}`}>Try again</Link>. Your saved follows have not changed.</p></main>;
  }
  const anime = seed?.anime.find((a) => a.slug === slug);
  if (!seed || !anime) notFound();
  return (
    <main>
      <SeedProvider seed={seed}><AnimeDetail animeId={anime.id} builtAt={new Date().toISOString()} /></SeedProvider>
    </main>
  );
}
