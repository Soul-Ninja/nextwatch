import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadAnimeSeed, loadSearch, loadSeed } from './data';
import { fetchTmdbSeed, fetchTmdbTitle, searchTmdb } from './tmdb';
import { seed } from './seed';

// Outside Next.js there is no data cache; the wrapper itself is Next's, tested by Next.
vi.mock('next/cache', () => ({ unstable_cache: <T,>(fn: T) => fn }));

vi.mock('./tmdb', async (importOriginal) => ({
  ...await importOriginal<typeof import('./tmdb')>(),
  fetchTmdbSeed: vi.fn(), fetchTmdbTitle: vi.fn(), searchTmdb: vi.fn(),
}));

afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe('server data selection', () => {
  it('keeps the no-token fictional search working', async () => {
    vi.stubEnv('TMDB_TOKEN', '');
    const result = await loadSearch('orchard', 1);
    expect(result.seed.fictional).toBe(true);
    expect(result.seed.anime.map((a) => a.id)).toEqual(['a-orchard', 'a-orchard-2']);
    expect(searchTmdb).not.toHaveBeenCalled();
  });

  it('searches the provider independently of the upcoming feed', async () => {
    vi.stubEnv('TMDB_TOKEN', 'test');
    vi.mocked(searchTmdb).mockResolvedValue({ seed: { fictional: false, anime: [], events: [], evidence: [] }, page: 2, hasMore: false });
    expect((await loadSearch('older anime', 2)).page).toBe(2);
    expect(searchTmdb).toHaveBeenCalledWith('test', 'older anime', 2);
    expect(fetchTmdbSeed).not.toHaveBeenCalled();
  });

  it('marks a discovery outage as unavailable instead of replacing it with fictional releases', async () => {
    vi.stubEnv('TMDB_TOKEN', 'test');
    vi.mocked(fetchTmdbSeed).mockRejectedValue(new Error('HTTP 401'));
    expect(await loadSeed()).toEqual({ fictional: false, unavailable: true, anime: [], events: [], evidence: [] });
    vi.mocked(searchTmdb).mockRejectedValue(new Error('HTTP 401'));
    await expect(loadSearch('anime', 1)).rejects.toThrow('HTTP 401');
  });

  it('fails a production build instead of shipping an empty schedule', async () => {
    vi.stubEnv('TMDB_TOKEN', 'test');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    vi.mocked(fetchTmdbSeed).mockRejectedValue(new Error('HTTP 503'));
    await expect(loadSeed()).rejects.toThrow('HTTP 503');
  });

  it('resolves an ID outside the feed, while retaining fictional slug lookup without a token', async () => {
    vi.stubEnv('TMDB_TOKEN', 'test');
    vi.mocked(fetchTmdbTitle).mockResolvedValue({ fictional: false, anime: [], events: [], evidence: [] });
    expect((await loadAnimeSeed('tmdb-tv-101'))?.fictional).toBe(false);
    expect(fetchTmdbSeed).not.toHaveBeenCalled();
    vi.stubEnv('TMDB_TOKEN', '');
    expect(await loadAnimeSeed(seed.anime[0]!.slug)).toBe(seed);
    expect(await loadAnimeSeed('not-a-title')).toBeNull();
  });
});
