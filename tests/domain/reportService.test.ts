/**
 * Report assembly from records. Built in Phase 4, increment 25.
 * Covers R-18 assembly over stated Love/Trust; reinforces the stated-only discipline.
 */
import { describe, it, expect } from 'vitest';
import { buildInsightReport } from '../../src/domain/reportService';
import type { FeedbackRecord } from '../../src/domain/feedbackRecord';

const rec = (over: Partial<FeedbackRecord> = {}): FeedbackRecord => ({
  recordId: 'r1', accountId: 'a1', brandId: 'b1', sourceId: 's1', sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00.000Z', isComplete: true, flags: [], ...over,
});

describe('buildInsightReport (R-18)', () => {
  it('derives the stated Brand Love and Trust indices from records', () => {
    const records = [
      rec({ recordId: 'r1', brandLove: 'love', trust: 5 }),
      rec({ recordId: 'r2', brandLove: 'like', trust: 4 }),
      rec({ recordId: 'r3', brandLove: 'hate', trust: 1 }),
    ];
    const report = buildInsightReport(records, { brandName: 'Acme' });
    expect(report.brandName).toBe('Acme');
    // 2 positive (love+like) − 1 negative (hate) over 3 stated = +33
    expect(report.metrics.brandLoveIndex).toBe(33);
    // trust: 2 positive (4,5) − 1 negative (1) over 3 = +33
    expect(report.metrics.trustIndex).toBe(33);
  });

  it('reports "no stated data" honestly when there are no reads', () => {
    const report = buildInsightReport([rec({ brandLove: undefined, trust: undefined })], { brandName: 'Acme' });
    expect(report.metrics.brandLoveIndex).toBeNull();
    expect(report.metrics.trustIndex).toBeNull();
  });

  it('restricts to the own brand when ownBrandId is given', () => {
    const records = [
      rec({ recordId: 'r1', brandId: 'mine', brandLove: 'love' }),
      rec({ recordId: 'r2', brandId: 'rival', brandLove: 'hate' }),
    ];
    const report = buildInsightReport(records, { brandName: 'Mine', ownBrandId: 'mine' });
    expect(report.metrics.brandLoveIndex).toBe(100); // only the own-brand 'love'
  });

  it('ignores an out-of-range trust value instead of throwing', () => {
    const report = buildInsightReport([rec({ trust: 9 })], { brandName: 'Acme' });
    expect(report.metrics.trustIndex).toBeNull();
  });
});
