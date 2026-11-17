import { describe, expect, it } from 'vitest';
import { countdown } from './countdown';

describe('countdown', () => {
  it('splits the remaining time', () => {
    expect(countdown('2026-11-20T15:15:00Z', '2026-11-17T09:00:30Z')).toEqual({ days: 3, hours: 6, minutes: 14, seconds: 30 });
  });
  it('returns null at and after the instant', () => {
    expect(countdown('2026-11-20T15:15:00Z', '2026-11-20T15:15:00Z')).toBeNull();
    expect(countdown('2026-11-20T15:15:00Z', '2026-11-21T00:00:00Z')).toBeNull();
  });
  it('returns null for an unparseable instant instead of NaN', () => {
    expect(countdown('not a date', '2026-11-17T00:00:00Z')).toBeNull();
  });
});
