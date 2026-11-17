import type { MetadataRoute } from 'next';
import { seed } from '../lib/seed';
import { SITE_URL } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['', '/horizon', '/about'].map((path) => ({ url: `${SITE_URL}${path}` })),
    ...seed.anime.map((a) => ({ url: `${SITE_URL}/anime/${a.slug}` })),
  ];
}
