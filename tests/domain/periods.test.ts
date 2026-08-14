/**
 * Reporting period boundaries. Built in Phase 4, increment 16.
 * Covers: E-22 (UTC storage + account-timezone boundaries).
 */
import { describe, it, expect } from 'vitest';
import { dayBoundsUtc, priorDayBoundsUtc } from '../../src/domain/periods';

describe('dayBoundsUtc (E-22)', () => {
  it('E-22: in UTC, the day bounds are midnight to end-of-day UTC', () => {
    const b = dayBoundsUtc('2026-08-14T15:00:00.000Z', 0);
    expect(b.startUtc).toBe('2026-08-14T00:00:00.000Z');
    expect(b.endUtc).toBe('2026-08-14T23:59:59.999Z');
  });

  it('E-22: in UTC−7, an early-UTC instant belongs to the previous local day', () => {
    // 02:00Z on the 14th is 19:00 on the 13th local (UTC−7)
    const b = dayBoundsUtc('2026-08-14T02:00:00.000Z', -420);
    expect(b.startUtc).toBe('2026-08-13T07:00:00.000Z'); // local midnight 08-13 = 07:00Z
    expect(b.endUtc).toBe('2026-08-14T06:59:59.999Z');
  });

  it('E-22: the prior period is the preceding local day', () => {
    const prior = priorDayBoundsUtc('2026-08-14T15:00:00.000Z', 0);
    expect(prior.startUtc).toBe('2026-08-13T00:00:00.000Z');
  });
});
