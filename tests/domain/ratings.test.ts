/**
 * Rating normalisation to a common 1..5. Built in Phase 4, increment 1.
 * Covers: E-15, INV-2.
 */
import { describe, it, expect } from 'vitest';
import { normalizeRating, averageNormalized } from '../../src/domain/ratings';

describe('normalizeRating', () => {
  it('E-15: 5-star passes through within 1..5', () => {
    expect(normalizeRating(5, '5_star')).toBe(5);
    expect(normalizeRating(1, '5_star')).toBe(1);
  });

  it('E-15: 10-point and NPS map onto 1..5', () => {
    expect(normalizeRating(10, '10_pt')).toBe(5);
    expect(normalizeRating(1, '10_pt')).toBe(1);
    expect(normalizeRating(0, 'nps')).toBe(1); // NPS floor 0 -> 1
    expect(normalizeRating(10, 'nps')).toBe(5);
  });

  it('E-15: out-of-range and non-numeric scales are un-mappable (null)', () => {
    expect(normalizeRating(6, '5_star')).toBeNull();
    expect(normalizeRating(-1, 'nps')).toBeNull();
    expect(normalizeRating(3, 'brand_love')).toBeNull(); // handled by its own module
  });
});

describe('averageNormalized', () => {
  it('E-15: averages only the mappable values, excluding nulls', () => {
    expect(averageNormalized([5, 1, null])).toBe(3);
    expect(averageNormalized([null, null])).toBeNull();
  });
});
