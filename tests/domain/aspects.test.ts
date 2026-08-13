/**
 * Strengths & Gripes (aspect analysis). Built in Phase 4, increment 12.
 * Covers: R-48, O-18, INV-16, INV-3 (traceability), E-26.
 */
import { describe, it, expect } from 'vitest';
import {
  aggregateAspects,
  buildStrengthsAndGripes,
  RELATIONSHIP_KIND,
  type AspectRead,
} from '../../src/domain/aspects';
import { baselineAspectExtractor } from '../../src/domain/baselineAspects';

const read = (recordId: string, aspect: string, polarity: 'positive' | 'negative', confidence = 0.9): AspectRead => ({
  recordId,
  aspect,
  polarity,
  intensity: 0.7,
  confidence,
});

describe('aggregateAspects (R-48 / O-18)', () => {
  it('R-48: tallies strengths and gripes per aspect with net, volume, and traceable records', () => {
    const summaries = aggregateAspects([
      read('r1', 'support', 'positive'),
      read('r2', 'support', 'positive'),
      read('r3', 'support', 'negative'),
      read('r4', 'price_value', 'negative'),
    ]);
    const support = summaries.find((s) => s.aspect === 'support')!;
    expect(support.strengths).toBe(2);
    expect(support.gripes).toBe(1);
    expect(support.volume).toBe(3);
    expect(support.net).toBe(1);
    expect(support.recordIds.sort()).toEqual(['r1', 'r2', 'r3']);
    expect(summaries[0]?.aspect).toBe('support'); // ordered by volume
  });

  it('E-26: low-confidence reads are excluded', () => {
    const summaries = aggregateAspects([read('r1', 'support', 'positive', 0.3)], { confidenceFloor: 0.5 });
    expect(summaries).toHaveLength(0);
  });

  it('INV-16/R-48: aspect↔Love/Trust is labeled association, not causation', () => {
    expect(RELATIONSHIP_KIND).toBe('association');
  });
});

describe('buildStrengthsAndGripes with the baseline extractor (R-48)', () => {
  it('R-48: pulls a strength and a gripe from real comments end-to-end', async () => {
    const board = await buildStrengthsAndGripes(
      [
        { recordId: 'r1', text: 'the support team was great and helpful' },
        { recordId: 'r2', text: 'the price is far too expensive' },
      ],
      baselineAspectExtractor,
    );
    const support = board.find((s) => s.aspect === 'support');
    const price = board.find((s) => s.aspect === 'price_value');
    expect(support?.strengths).toBe(1);
    expect(price?.gripes).toBe(1);
  });
});
