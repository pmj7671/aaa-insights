/**
 * Brand Trust — stated-only net Trust Index. Built in Phase 4, increment 1.
 * Covers: R-32, O-12, INV-14.
 */
import { describe, it, expect } from 'vitest';
import { trustIndex } from '../../src/domain/trust';
import type { TrustRead } from '../../src/domain/types';

const stated = (value: number): TrustRead => ({ value, source: 'stated' });
const inferred = (value: number): TrustRead => ({ value, source: 'inferred', confidence: 0.8 });

describe('trustIndex', () => {
  it('R-32/O-12: net trust = %positive − %negative over stated reads', () => {
    // positives (>=4): 3, negatives (<=2): 1, neutral(3): 1 -> (3-1)/5 = +40
    const r = trustIndex([stated(5), stated(4), stated(4), stated(3), stated(1)]);
    expect(r.statedCount).toBe(5);
    expect(r.index).toBe(40);
  });

  it('INV-14: inferred trust is excluded from the stated headline', () => {
    const base = [stated(5), stated(1)]; // (1-1)/2 = 0
    const r = trustIndex([...base, inferred(5), inferred(5)]);
    expect(r.index).toBe(0);
    expect(r.inferredExcluded).toBe(2);
  });

  it('returns null when there are no stated reads', () => {
    expect(trustIndex([inferred(5)]).index).toBeNull();
  });

  it('rejects an un-normalised trust value (must be 1..5)', () => {
    expect(() => trustIndex([stated(7)])).toThrow(/1\.\.5/);
  });
});
