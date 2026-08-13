/**
 * Competitive benchmark. Built in Phase 4, increment 12.
 * Covers: R-27, O-9, E-14.
 */
import { describe, it, expect } from 'vitest';
import { benchmark, type BrandMetrics } from '../../src/domain/benchmark';

const brands: BrandMetrics[] = [
  { brandId: 'own', brandName: 'Us', type: 'own', brandLoveIndex: 40, trustIndex: 30, avgRating: 4.2, negSentimentShare: 15 },
  { brandId: 'c1', brandName: 'Rival A', type: 'competitor', brandLoveIndex: 25, trustIndex: 35, avgRating: 3.8, negSentimentShare: 22 },
  { brandId: 'c2', brandName: 'Rival B', type: 'competitor', brandLoveIndex: null, trustIndex: 10, avgRating: null, negSentimentShare: 30 },
];

describe('benchmark (R-27 / O-9)', () => {
  it('R-27: compares own vs each competitor across metrics with deltas', () => {
    const result = benchmark(brands)!;
    const love = result.rows.find((r) => r.metric === 'Brand Love Index')!;
    expect(love.own).toBe(40);
    const rivalA = love.competitors.find((c) => c.brandId === 'c1')!;
    expect(rivalA.value).toBe(25);
    expect(rivalA.deltaVsOwn).toBe(15); // 40 − 25
  });

  it('E-14: a missing competitor value yields null value and null delta, not a fabricated number', () => {
    const result = benchmark(brands)!;
    const love = result.rows.find((r) => r.metric === 'Brand Love Index')!;
    const rivalB = love.competitors.find((c) => c.brandId === 'c2')!;
    expect(rivalB.value).toBeNull();
    expect(rivalB.deltaVsOwn).toBeNull();
  });

  it('returns null when there is no own brand', () => {
    expect(benchmark([{ brandId: 'c1', brandName: 'A', type: 'competitor' }])).toBeNull();
  });
});
