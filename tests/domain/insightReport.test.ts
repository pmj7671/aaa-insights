/**
 * Insight report. Built in Phase 4, increment 15.
 * Covers: R-18, O-5.
 */
import { describe, it, expect } from 'vitest';
import { assembleInsightReport, rankActions } from '../../src/domain/insightReport';

describe('rankActions (R-18)', () => {
  it('R-18: high-priority actions (negative trust, at-risk) come first', () => {
    const actions = rankActions({
      brandName: 'Us',
      brandLoveIndex: 10,
      trustIndex: -5,
      atRiskCount: 3,
      negSentimentShare: 35,
      topGripe: { aspect: 'support', gripes: 8 },
    });
    expect(actions[0]?.priority).toBe('high');
    expect(actions.map((a) => a.priority)).toEqual([...actions.map((a) => a.priority)].sort((x, y) => {
      const order = { high: 0, medium: 1, low: 2 } as const;
      return order[x] - order[y];
    }));
    expect(actions.some((a) => /trust/i.test(a.action))).toBe(true);
    expect(actions.some((a) => /at-risk/i.test(a.action))).toBe(true);
  });

  it('R-18: a healthy picture yields an advocacy action', () => {
    const actions = rankActions({ brandName: 'Us', brandLoveIndex: 45, trustIndex: 30, atRiskCount: 0 });
    expect(actions).toEqual([{ priority: 'low', action: 'Activate advocates', rationale: expect.any(String) }]);
  });
});

describe('assembleInsightReport (R-18 / O-5)', () => {
  it('R-18: assembles headline, metrics, themes, and ranked actions', () => {
    const report = assembleInsightReport({
      brandName: 'Acme',
      brandLoveIndex: 40,
      trustIndex: 25,
      negSentimentShare: 12,
      topThemes: [{ label: 'Support', count: 10 }],
    });
    expect(report.headline).toMatch(/Acme/);
    expect(report.metrics.brandLoveIndex).toBe(40);
    expect(report.topThemes).toHaveLength(1);
    expect(Array.isArray(report.actions)).toBe(true);
  });

  it('R-18/INV-14: with no stated Love, the headline says so rather than inventing a number', () => {
    const report = assembleInsightReport({ brandName: 'Acme', brandLoveIndex: null, trustIndex: null });
    expect(report.headline).toMatch(/no stated Brand Love/i);
  });
});
