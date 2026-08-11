/**
 * Brand Love — analysis-core tests. Built (green) in Phase 4, increment 1.
 * Covers: R-30, O-11, INV-4, INV-14, E-24, F-12.
 */
import { describe, it, expect } from 'vitest';
import { brandLoveIndex, normalizeLoveLabel, loveOrdinal } from '../../src/domain/brandLove';
import type { LoveRead } from '../../src/domain/types';

const stated = (label: LoveRead['label']): LoveRead => ({ label, source: 'stated' });
const inferred = (label: LoveRead['label']): LoveRead => ({ label, source: 'inferred', confidence: 0.9 });

describe('normalizeLoveLabel', () => {
  it('R-30: maps canonical and synonym labels to the stated scale', () => {
    expect(normalizeLoveLabel('Love')).toBe('love');
    expect(normalizeLoveLabel(' like ')).toBe('like');
    expect(normalizeLoveLabel('ambivalent')).toBe('ambivalence');
  });

  it('F-12/INV-14: an unreadable or empty value is "unknown", never "ambivalence"', () => {
    expect(normalizeLoveLabel('')).toBe('unknown');
    expect(normalizeLoveLabel(null)).toBe('unknown');
    expect(normalizeLoveLabel('¯\\_(ツ)_/¯')).toBe('unknown');
    expect(normalizeLoveLabel('asdf')).not.toBe('ambivalence');
  });

  it('loveOrdinal: unknown has no ordinal; stated labels are 5..1', () => {
    expect(loveOrdinal('love')).toBe(5);
    expect(loveOrdinal('hate')).toBe(1);
    expect(loveOrdinal('unknown')).toBeNull();
  });
});

describe('brandLoveIndex', () => {
  it('R-30/O-11: Index = %(Love+Like) − %(Dislike+Hate) over stated reads', () => {
    // 3 love+like, 1 dislike/hate, out of 5 stated -> (3-1)/5 = +40
    const reads = [stated('love'), stated('love'), stated('like'), stated('ambivalence'), stated('dislike')];
    const r = brandLoveIndex(reads);
    expect(r.statedCount).toBe(5);
    expect(r.index).toBe(40);
  });

  it('INV-4/INV-14: inferred reads never move the stated headline Index', () => {
    const base = [stated('love'), stated('dislike')]; // (1-1)/2 = 0
    const withInferred = [...base, inferred('love'), inferred('love'), inferred('love')];
    expect(brandLoveIndex(base).index).toBe(0);
    const r = brandLoveIndex(withInferred);
    expect(r.index).toBe(0); // unchanged by inferred
    expect(r.inferredExcluded).toBe(3);
    expect(r.statedCount).toBe(2);
  });

  it('E-24/F-12: "unknown" is excluded from the denominator, not scored as ambivalence', () => {
    const reads = [stated('love'), stated('like'), stated('unknown'), stated('unknown')];
    const r = brandLoveIndex(reads);
    expect(r.statedCount).toBe(2); // unknowns excluded
    expect(r.unknownCount).toBe(2);
    expect(r.distribution.ambivalence).toBe(0); // never coerced
    expect(r.index).toBe(100); // both stated are love/like
  });

  it('E-24: with no stated reads the Index is null ("no stated data"), never 0', () => {
    const r = brandLoveIndex([inferred('love'), stated('unknown')]);
    expect(r.index).toBeNull();
    expect(r.statedCount).toBe(0);
  });

  it('INV-2: distribution counts each read once and stays within bounds', () => {
    const reads = [stated('hate'), stated('hate'), stated('love')];
    const r = brandLoveIndex(reads);
    expect(r.distribution.hate).toBe(2);
    expect(r.distribution.love).toBe(1);
    expect(r.index).toBeGreaterThanOrEqual(-100);
    expect(r.index).toBeLessThanOrEqual(100);
  });
});
