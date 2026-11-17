import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seed } from '../../../lib/seed';
import { titleOf } from '../../../lib/universe';
import { AnimeDetail } from './AnimeDetail';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false; // only titles in the seed have pages
export const generateStaticParams = () => seed.anime.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = seed.anime.find((a) => a.slug === slug);
  return { title: anime ? `${titleOf(anime)} · Nextwatch` : 'Nextwatch' };
}

export default async function AnimePage({ params }: Props) {
  const { slug } = await params;
  const anime = seed.anime.find((a) => a.slug === slug);
  if (!anime) notFound();
  return (
    <main>
      <AnimeDetail animeId={anime.id} builtAt={new Date().toISOString()} />
    </main>
  );
}
