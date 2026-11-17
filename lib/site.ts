// Deployment-specific values. SITE_URL is set by the host; the fallback is for local development.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Where readers report wrong dates or sources. Must be reachable by the public before launch.
export const CORRECTIONS_URL = 'https://github.com/Soul-Ninja/nextwatch/issues/new';
