const REVALIDATE_SECONDS = 6 * 3600; // provider data is refreshed every 6 hours

/**
 * GET JSON from an external API, retrying dropped connections, timeouts, 429 and 5xx (3 attempts, honouring
 * Retry-After). Throws "<label> failed: ..." so a broken feed is loud, not silent.
 */
export async function getJson<T>(
  label: string, url: string, headers: Record<string, string>,
  fetchImpl: typeof fetch = fetch, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms)),
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetchImpl(url, {
        headers: { Accept: 'application/json', ...headers },
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: REVALIDATE_SECONDS },
      } as RequestInit);
    } catch (error) {
      if (attempt >= 3) throw new Error(`${label} failed: ${String(error)}`);
      await sleep(1000 * attempt);
      continue;
    }
    if (res.ok) return (await res.json()) as T;
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 3) throw new Error(`${label} failed: HTTP ${res.status}`);
    const wait = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(wait) && wait > 0 ? wait * 1000 : 1000 * attempt);
  }
}
