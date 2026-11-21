import { describe, expect, it } from 'vitest';
import { createLimiter } from './rateLimit';

describe('createLimiter', () => {
  it('allows up to the limit per window, per key, then resets', () => {
    const allow = createLimiter(2, 60_000);
    expect([allow('a', 0), allow('a', 1), allow('a', 2)]).toEqual([true, true, false]);
    expect(allow('b', 3)).toBe(true); // other visitors unaffected
    expect(allow('a', 60_000)).toBe(true); // new window
  });

  it('keeps memory bounded under many keys', () => {
    const allow = createLimiter(1, 60_000, 3);
    for (const k of ['a', 'b', 'c', 'd', 'e']) expect(allow(k, 0)).toBe(true);
  });
});
