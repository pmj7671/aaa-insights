/**
 * Theme analysis aggregation. Built in Phase 4, increment 7.
 * Covers: R-14, O-2, and the traceability spine (INV-3 / R-16 for themes).
 */
import { describe, it, expect } from 'vitest';
import { aggregateThemes, type ThemeAssignment } from '../../src/domain/themes';

const a = (recordId: string, themeId: string, label: string, confidence: number, quote?: string): ThemeAssignment =>
  quote === undefined ? { recordId, themeId, label, confidence } : { recordId, themeId, label, confidence, quote };

describe('aggregateThemes (R-14)', () => {
  it('R-14: counts distinct records per theme, ordered by count desc, with a share', () => {
    const summaries = aggregateThemes(
      [
        a('r1', 't-support', 'Support', 0.9),
        a('r2', 't-support', 'Support', 0.9),
        a('r3', 't-price', 'Price', 0.9),
      ],
      { total: 3 },
    );
    expect(summaries[0]?.themeId).toBe('t-support');
    expect(summaries[0]?.count).toBe(2);
    expect(summaries[0]?.share).toBeCloseTo(66.7, 1);
    expect(summaries[1]?.themeId).toBe('t-price');
  });

  it('R-14: representative quotes are highest-confidence first, de-duplicated, capped', () => {
    const summaries = aggregateThemes(
      [
        a('r1', 't', 'Theme', 0.6, 'good'),
        a('r2', 't', 'Theme', 0.95, 'great'),
        a('r3', 't', 'Theme', 0.8, 'great'), // duplicate quote
      ],
      { maxQuotes: 2 },
    );
    expect(summaries[0]?.representativeQuotes).toEqual(['great', 'good']);
  });

  it('INV-3/R-16: each theme carries its record ids (opens the underlying responses)', () => {
    const summaries = aggregateThemes([a('r1', 't', 'Theme', 0.9), a('r1', 't', 'Theme', 0.9)]);
    // same record assigned twice -> counted once (INV-2), but traceable
    expect(summaries[0]?.count).toBe(1);
    expect(summaries[0]?.recordIds).toEqual(['r1']);
  });

  it('excludes low-confidence assignments from the summary', () => {
    const summaries = aggregateThemes([a('r1', 't', 'Theme', 0.3)], { confidenceFloor: 0.5 });
    expect(summaries).toHaveLength(0);
  });
});
