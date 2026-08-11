/**
 * Metric counting invariants. Built in Phase 4, increment 1.
 * Covers: INV-2.
 */
import { describe, it, expect } from 'vitest';
import { share, countByCategory } from '../../src/domain/metrics';

describe('share', () => {
  it('INV-2: returns a percentage within 0..100', () => {
    expect(share(1, 4)).toBe(25);
    expect(share(0, 0)).toBe(0); // no division by zero, no fabricated share
    expect(share(3, 3)).toBe(100);
  });

  it('INV-2: rejects a count greater than the total or negative counts', () => {
    expect(() => share(5, 3)).toThrow(/cannot exceed/);
    expect(() => share(-1, 3)).toThrow(/non-negative/);
  });
});

describe('countByCategory', () => {
  it('INV-2: counts each item once and the counts sum to the total', () => {
    const { counts, total } = countByCategory(['a', 'b', 'a', 'c', 'a']);
    expect(counts.a).toBe(3);
    expect(counts.b).toBe(1);
    expect(total).toBe(5);
  });
});
