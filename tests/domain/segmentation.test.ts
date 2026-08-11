/**
 * Love × Trust segmentation. Built in Phase 4, increment 2.
 * Covers: R-33, O-13, INV-12, INV-2.
 */
import { describe, it, expect } from 'vitest';
import {
  segment,
  quadrantOf,
  levelFrom,
  segmentDistribution,
  type SegmentPoint,
} from '../../src/domain/segmentation';

describe('quadrantOf', () => {
  it('R-33/O-13: maps the four Love×Trust combinations to the right quadrants', () => {
    expect(quadrantOf('high', 'high')).toBe('devoted');
    expect(quadrantOf('high', 'low')).toBe('infatuated');
    expect(quadrantOf('low', 'high')).toBe('dependable');
    expect(quadrantOf('low', 'low')).toBe('at_risk');
  });

  it('INV-12: Love and Trust are distinct axes — swapping them changes the quadrant', () => {
    // high love / low trust (infatuated) is NOT the same as low love / high trust (dependable)
    expect(quadrantOf('high', 'low')).not.toBe(quadrantOf('low', 'high'));
  });
});

describe('segment', () => {
  it('O-13: each quadrant carries a recommended action', () => {
    expect(segment('high', 'high').action).toMatch(/advocates/i);
    expect(segment('high', 'low').action).toMatch(/reliability|transparency/i);
    expect(segment('low', 'high').action).toMatch(/deepen/i);
    expect(segment('low', 'low').action).toMatch(/intervene|triage/i);
  });
});

describe('levelFrom', () => {
  it('derives high/low from a score and threshold (>= is high)', () => {
    expect(levelFrom(4, 3.5)).toBe('high');
    expect(levelFrom(3, 3.5)).toBe('low');
  });
});

describe('segmentDistribution', () => {
  it('INV-2: counts each respondent once across all four quadrants', () => {
    const points: SegmentPoint[] = [
      { love: 'high', trust: 'high' },
      { love: 'high', trust: 'high' },
      { love: 'high', trust: 'low' },
      { love: 'low', trust: 'low' },
    ];
    const { counts, total } = segmentDistribution(points);
    expect(counts.devoted).toBe(2);
    expect(counts.infatuated).toBe(1);
    expect(counts.dependable).toBe(0);
    expect(counts.at_risk).toBe(1);
    expect(total).toBe(4);
  });
});
