/**
 * FeedbackRecord attribution. Built in Phase 4, increment 6.
 * Covers: INV-1.
 */
import { describe, it, expect } from 'vitest';
import { validateFeedbackRecord, isAttributed, type FeedbackRecord } from '../../src/domain/feedbackRecord';

const rec = (over: Partial<FeedbackRecord> = {}): FeedbackRecord => ({
  recordId: 'r1',
  accountId: 'acc1',
  brandId: 'brand1',
  sourceId: 'src1',
  sourceType: 'survey',
  capturedAt: '2026-08-11T10:00:00Z',
  isComplete: true,
  flags: [],
  ...over,
});

describe('validateFeedbackRecord (INV-1)', () => {
  it('INV-1: a fully attributed record is valid', () => {
    expect(validateFeedbackRecord(rec())).toEqual([]);
    expect(isAttributed(rec())).toBe(true);
  });

  it('INV-1: a record with no brand or no source is rejected', () => {
    expect(validateFeedbackRecord(rec({ brandId: '' })).some((e) => e.field === 'brandId')).toBe(true);
    expect(validateFeedbackRecord(rec({ sourceId: '' })).some((e) => e.field === 'sourceId')).toBe(true);
    expect(isAttributed(rec({ brandId: '' }))).toBe(false);
  });

  it('rejects an invalid timestamp', () => {
    expect(validateFeedbackRecord(rec({ capturedAt: 'not-a-date' })).some((e) => e.field === 'capturedAt')).toBe(true);
  });
});
