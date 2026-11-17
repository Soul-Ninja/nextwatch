import { describe, expect, it } from 'vitest';
import { seed } from './seed';
import type { DatePrecision, ReleaseEvent, Seed } from './types';
import { seedProblems } from './validate';

function problemsAfter(change: (s: Seed, event: (id: string) => ReleaseEvent) => void): string {
  const copy: Seed = JSON.parse(JSON.stringify(seed));
  const event = (id: string) => {
    const found = copy.events.find((e) => e.id === id);
    if (!found) throw new Error(`no fixture event ${id}`);
    return found;
  };
  change(copy, event);
  return seedProblems(copy).join('\n');
}

describe('seed fixtures', () => {
  it('pass every invariant', () => {
    expect(seedProblems(seed)).toEqual([]);
  });

  it('are labeled fictional', () => {
    expect(seed.fictional).toBe(true);
  });

  it('cover every date precision and a region-specific streaming event', () => {
    const precisions = new Set(seed.events.map((e) => e.window.precision));
    const all: DatePrecision[] = ['EXACT', 'DAY', 'MONTH', 'SEASON', 'YEAR', 'TBA'];
    expect([...precisions].sort()).toEqual([...all].sort());
    expect(seed.events.some((e) => e.kind === 'STREAMING_RELEASE' && e.region && e.platform)).toBe(true);
  });

  it('keep the Japan broadcast at 00:15 JST on the previous UTC day', () => {
    const w = seed.events.find((e) => e.id === 'e-starfall-ep5-jp')?.window;
    expect(w?.precision === 'EXACT' && w.instantUtc).toBe('2026-11-20T15:15:00Z');
  });
});

describe('seedProblems rejects', () => {
  it('an exact time that is not UTC', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep5-jp').window = { precision: 'EXACT', instantUtc: '2026-11-21T00:15:00+09:00' }; }))
      .toMatch(/must be a UTC instant/);
  });

  it('an impossible calendar date', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep5-in').window = { precision: 'DAY', localDate: '2027-02-30' }; }))
      .toMatch(/not a calendar date/);
  });

  it('an unknown timezone', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep5-jp').window = { precision: 'EXACT', instantUtc: '2026-11-20T15:15:00Z', timezone: 'Japan/Tokio' }; }))
      .toMatch(/unknown timezone/);
  });

  it('a month or season with a bad year or month', () => {
    expect(problemsAfter((_, e) => { e('e-lantern-ep1-jp').window = { precision: 'MONTH', year: 2027, month: 13 }; })).toMatch(/bad month 13/);
    expect(problemsAfter((_, e) => { e('e-orchard-2-jp').window = { precision: 'SEASON', year: 27, season: 'FALL' }; })).toMatch(/bad year 27/);
  });

  it('streaming availability without a region', () => {
    expect(problemsAfter((_, e) => { delete e('e-starfall-ep5-in').region; })).toMatch(/needs both a region and a platform/);
  });

  it('a broadcast status on a streaming event', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep5-in').status = 'BROADCAST_AIRED'; })).toMatch(/only applies to TV_BROADCAST/);
  });

  it('a streaming status on a broadcast event', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep4-jp').status = 'STREAMING_AVAILABLE'; })).toMatch(/only applies to STREAMING_RELEASE/);
  });

  it('SCHEDULED with a TBA window', () => {
    expect(problemsAfter((_, e) => { e('e-kitsune').status = 'SCHEDULED'; })).toMatch(/SCHEDULED needs a window/);
  });

  it('DELAYED without the previous window', () => {
    expect(problemsAfter((_, e) => { delete e('e-lantern-ep1-jp').history; })).toMatch(/DELAYED must keep the previous window/);
  });

  it('an event with no evidence or unknown evidence', () => {
    expect(problemsAfter((_, e) => { e('e-kitsune').evidenceIds = []; })).toMatch(/at least one evidence/);
    expect(problemsAfter((_, e) => { e('e-kitsune').evidenceIds = ['ev-missing']; })).toMatch(/unknown evidence ev-missing/);
  });

  it('a non-https source url', () => {
    expect(problemsAfter((s) => { s.evidence[0]!.url = 'http://example.com/x'; })).toMatch(/must be https/);
  });

  it('duplicate ids and slugs', () => {
    expect(problemsAfter((s) => { s.events.push({ ...s.events[0]! }); })).toMatch(/duplicate id e-starfall-ep5-jp/);
    expect(problemsAfter((s) => { s.anime[1]!.slug = s.anime[0]!.slug; })).toMatch(/duplicate slug/);
  });

  it('an apex pick that is not an event', () => {
    expect(problemsAfter((s) => { s.apexEventId = 'e-missing'; })).toMatch(/apex: unknown event e-missing/);
  });

  it('a lowercase or long region code', () => {
    expect(problemsAfter((_, e) => { e('e-starfall-ep5-in').region = 'india'; })).toMatch(/ISO 3166-1 alpha-2/);
  });
});
