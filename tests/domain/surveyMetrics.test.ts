/**
 * Core survey metrics — rates, NPS, CSAT. Built in Phase 4, increment 2.
 * Covers: R-19, O-4, INV-2.
 */
import { describe, it, expect } from 'vitest';
import { responseRate, completionRate, nps, csat } from '../../src/domain/surveyMetrics';

describe('rates', () => {
  it('R-19: response and completion rates are percentages', () => {
    expect(responseRate(25, 100)).toBe(25);
    expect(completionRate(3, 4)).toBe(75);
  });

  it('INV-2: a rate cannot exceed 100% (count > total is rejected)', () => {
    expect(() => responseRate(120, 100)).toThrow(/cannot exceed/);
  });
});

describe('nps', () => {
  it('R-19: NPS = %promoters (9–10) − %detractors (0–6)', () => {
    // 2 promoters, 1 passive, 1 detractor of 4 -> 50% - 25% = 25
    const r = nps([9, 10, 8, 3]);
    expect(r?.promoters).toBe(2);
    expect(r?.passives).toBe(1);
    expect(r?.detractors).toBe(1);
    expect(r?.nps).toBe(25);
  });

  it('returns null for an empty set and rejects out-of-range scores', () => {
    expect(nps([])).toBeNull();
    expect(() => nps([11])).toThrow(/0\.\.10/);
  });
});

describe('csat', () => {
  it('R-19: CSAT is top-2-box share on a 1–5 scale', () => {
    expect(csat([5, 4, 3, 1])).toBe(50); // 2 of 4 satisfied
    expect(csat([])).toBeNull();
    expect(() => csat([6])).toThrow(/1\.\.5/);
  });
});
