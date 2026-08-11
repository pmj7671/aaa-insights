/**
 * Sentiment aggregation core. Built in Phase 4, increment 4.
 * Covers: O-3, E-26. (R-15 full assignment stays pending — needs the AI seam.)
 */
import { describe, it, expect } from 'vitest';
import { aggregateSentiment, type Sentiment } from '../../src/domain/sentiment';

const s = (polarity: Sentiment['polarity'], confidence: number): Sentiment => ({
  polarity,
  intensity: 0.7,
  confidence,
});

describe('aggregateSentiment', () => {
  it('aggregates polarity and computes the negative share over scored reads', () => {
    const r = aggregateSentiment([s('positive', 0.9), s('negative', 0.9), s('neutral', 0.9), s('negative', 0.9)]);
    expect(r.scored).toBe(4);
    expect(r.negative).toBe(2);
    expect(r.negativeShare).toBe(50);
  });

  it('E-26: reads below the confidence floor are excluded, not counted as neutral', () => {
    const r = aggregateSentiment([s('negative', 0.9), s('positive', 0.3)], { confidenceFloor: 0.5 });
    expect(r.scored).toBe(1);
    expect(r.lowConfidenceExcluded).toBe(1);
    expect(r.neutral).toBe(0);
    expect(r.negativeShare).toBe(100);
  });

  it('returns a null share when nothing clears the floor (no fabricated zero)', () => {
    const r = aggregateSentiment([s('negative', 0.2)], { confidenceFloor: 0.5 });
    expect(r.scored).toBe(0);
    expect(r.negativeShare).toBeNull();
  });
});
