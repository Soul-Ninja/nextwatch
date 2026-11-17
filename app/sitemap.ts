import type { MetadataRoute } from 'next';
import { loadSeed } from '../lib/data';
import { SITE_URL } from '../lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seed = await loadSeed();
  return [
    ...['', '/horizon', '/about'].map((path) => ({ url: `${SITE_URL}${path}` })),
    ...seed.anime.map((a) => ({ url: `${SITE_URL}/anime/${a.slug}` })),
  ];
}
