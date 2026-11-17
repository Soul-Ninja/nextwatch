import type { MetadataRoute } from 'next';
import { loadSeed } from '../lib/data';
import { SITE_URL } from '../lib/site';

// Fictional sample data must never end up in search results.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if ((await loadSeed()).fictional) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` };
}
