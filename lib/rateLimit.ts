/**
 * Fixed-window request counter per key (e.g. visitor IP).
 * shortcut: counts live in one server instance's memory, so several instances each allow `limit`; add a Vercel
 * firewall rate-limit rule (or a shared store) for real protection once traffic is real.
 */
export function createLimiter(limit: number, windowMs: number, maxKeys = 10_000) {
  const hits = new Map<string, { start: number; count: number }>();
  return function allow(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k); // drop expired windows
        if (hits.size >= maxKeys) hits.clear(); // memory stays bounded even under a flood of new keys
      }
      hits.set(key, { start: now, count: 1 });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
