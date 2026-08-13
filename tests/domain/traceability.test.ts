/**
 * Traceability spine. Built in Phase 4, increment 8.
 * Covers: INV-3, R-16 — every read/aggregate opens its underlying responses.
 */
import { describe, it, expect } from 'vitest';
import {
  buildTraceIndex,
  openTrace,
  isTraceable,
  assertTraceable,
} from '../../src/domain/traceability';

describe('buildTraceIndex + openTrace (R-16 / INV-3)', () => {
  it('R-16: a Brand Love read opens the exact records behind each label', () => {
    const reads = [
      { recordId: 'r1', label: 'love' },
      { recordId: 'r2', label: 'love' },
      { recordId: 'r3', label: 'hate' },
    ];
    const index = buildTraceIndex(reads, (r) => r.label, (r) => r.recordId);
    expect(openTrace(index, 'love')).toEqual(['r1', 'r2']);
    expect(openTrace(index, 'hate')).toEqual(['r3']);
  });

  it('R-16: works the same for sentiment polarity and theme id (one mechanism)', () => {
    const sentiments = [
      { recordId: 'r1', polarity: 'negative' },
      { recordId: 'r2', polarity: 'negative' },
    ];
    const idx = buildTraceIndex(sentiments, (s) => s.polarity, (s) => s.recordId);
    expect(openTrace(idx, 'negative')).toEqual(['r1', 'r2']);
  });

  it('INV-2/INV-3: a record appearing twice under a key is opened once', () => {
    const reads = [
      { recordId: 'r1', label: 'love' },
      { recordId: 'r1', label: 'love' },
    ];
    const index = buildTraceIndex(reads, (r) => r.label, (r) => r.recordId);
    expect(openTrace(index, 'love')).toEqual(['r1']);
  });

  it('R-16: opening a key with no records returns an empty array, never throws', () => {
    const index = buildTraceIndex([{ recordId: 'r1', label: 'love' }], (r) => r.label, (r) => r.recordId);
    expect(openTrace(index, 'dislike')).toEqual([]);
  });

  it('INV-3: an item with no recordId is rejected — no untraceable claim', () => {
    expect(() => buildTraceIndex([{ recordId: '', label: 'love' }], (r) => r.label, (r) => r.recordId)).toThrow(/recordId/);
  });
});

describe('isTraceable / assertTraceable (INV-3)', () => {
  it('INV-3: an aggregate with underlying records is traceable; an empty one is not', () => {
    expect(isTraceable({ recordIds: ['r1'] })).toBe(true);
    expect(isTraceable({ recordIds: [] })).toBe(false);
    expect(() => assertTraceable({ recordIds: [] }, 'theme')).toThrow(/traceable/);
  });
});
