import type { MetadataRoute } from 'next';
import { seed } from '../lib/seed';
import { SITE_URL } from '../lib/site';

// Fictional sample data must never end up in search results.
export default function robots(): MetadataRoute.Robots {
  if (seed.fictional) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` };
}
