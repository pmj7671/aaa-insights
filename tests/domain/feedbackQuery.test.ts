/**
 * Feedback-hub query surface. Built in Phase 4, increment 14.
 * Covers: R-12, R-26, R-28, R-29 (with INV-9 / INV-3).
 */
import { describe, it, expect } from 'vitest';
import { applyFilter, unifiedCustomerView, perCompetitorAnalysis } from '../../src/domain/feedbackQuery';
import type { FeedbackRecord } from '../../src/domain/feedbackRecord';

const rec = (over: Partial<FeedbackRecord>): FeedbackRecord => ({
  recordId: 'r',
  accountId: 'acc1',
  brandId: 'own',
  sourceId: 's',
  sourceType: 'survey',
  capturedAt: '2026-08-01T10:00:00Z',
  isComplete: true,
  flags: [],
  ...over,
});

const records: FeedbackRecord[] = [
  rec({ recordId: 'r1', brandId: 'own', segment: 'enterprise', ratingNorm: 5, capturedAt: '2026-08-01T00:00:00Z' }),
  rec({ recordId: 'r2', brandId: 'own', segment: 'smb', ratingNorm: 2, capturedAt: '2026-08-10T00:00:00Z' }),
  rec({ recordId: 'r3', brandId: 'own', segment: 'enterprise', sourceType: 'import_csv', capturedAt: '2026-09-01T00:00:00Z' }),
  rec({ recordId: 'r4', brandId: 'rivalA', segment: 'smb', sourceType: 'web', ratingNorm: 3 }),
  rec({ recordId: 'r5', brandId: 'rivalA', segment: 'enterprise', sourceType: 'web' }),
];

describe('applyFilter (R-12)', () => {
  it('R-12: filters by brand', () => {
    expect(applyFilter(records, { brandId: 'rivalA' }).map((r) => r.recordId)).toEqual(['r4', 'r5']);
  });
  it('R-12: filters by source type and segment', () => {
    expect(applyFilter(records, { sourceType: 'import_csv' }).map((r) => r.recordId)).toEqual(['r3']);
    expect(applyFilter(records, { segment: 'smb' }).map((r) => r.recordId)).toEqual(['r2', 'r4']);
  });
  it('R-12: filters by date range and rating bounds', () => {
    expect(applyFilter(records, { from: '2026-08-05T00:00:00Z', to: '2026-08-31T00:00:00Z' }).map((r) => r.recordId)).toEqual(['r2']);
    expect(applyFilter(records, { ratingMax: 2 }).map((r) => r.recordId)).toEqual(['r2']); // r's without rating excluded when bound set
  });
});

describe('unifiedCustomerView (R-26 / INV-9)', () => {
  it('R-26: aggregates the own brand by segment as counts, with no identity fields', () => {
    const view = unifiedCustomerView(records, 'own');
    expect(view.total).toBe(3);
    expect(view.segments).toEqual([
      { segment: 'enterprise', count: 2 },
      { segment: 'smb', count: 1 },
    ]);
    // structural: the view exposes only brandId, total, and segment counts — no per-person data
    expect(Object.keys(view).sort()).toEqual(['brandId', 'segments', 'total']);
  });
});

describe('perCompetitorAnalysis (R-28 / R-29)', () => {
  it('R-28/R-29: aggregates a competitor and stays traceable to its source records', () => {
    const analysis = perCompetitorAnalysis(records, 'rivalA');
    expect(analysis.total).toBe(2);
    expect(analysis.recordIds.sort()).toEqual(['r4', 'r5']);
  });
  it('R-29: is filterable (e.g. by segment) while remaining traceable', () => {
    const analysis = perCompetitorAnalysis(records, 'rivalA', { segment: 'smb' });
    expect(analysis.total).toBe(1);
    expect(analysis.recordIds).toEqual(['r4']);
  });
});
