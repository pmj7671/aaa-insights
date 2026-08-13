/**
 * Text analysis end-to-end (baseline classifiers on the seams).
 * Built in Phase 4, increment 11. Covers: R-15, R-46 (with baseline classifiers),
 * E-25, E-27 via the profile.
 */
import { describe, it, expect } from 'vitest';
import { assignSentiment, buildEmotionProfile } from '../../src/domain/analyzeText';
import { baselineSentimentClassifier } from '../../src/domain/baselineSentiment';
import { baselineEmotionClassifier } from '../../src/domain/baselineEmotion';

const records = [
  { recordId: 'r1', text: 'I love the fast, reliable support' },
  { recordId: 'r2', text: 'terrible and slow, so frustrating' },
  { recordId: 'r3', text: 'the meeting is scheduled for noon' },
];

describe('baseline sentiment classifier', () => {
  it('classifies positive, negative, and neutral text', async () => {
    expect((await baselineSentimentClassifier.classify('I love this, great and helpful')).polarity).toBe('positive');
    expect((await baselineSentimentClassifier.classify('awful, slow and broken')).polarity).toBe('negative');
    expect((await baselineSentimentClassifier.classify('it happened on tuesday')).polarity).toBe('neutral');
  });
});

describe('assignSentiment (R-15)', () => {
  it('R-15: assigns a sentiment to each response and aggregates', async () => {
    const { assignments, aggregate } = await assignSentiment(records, baselineSentimentClassifier);
    expect(assignments).toHaveLength(3); // one per response
    expect(assignments[0]?.sentiment.polarity).toBe('positive');
    expect(assignments[1]?.sentiment.polarity).toBe('negative');
    // r3 is neutral/low-confidence -> dropped by the floor; r1 pos, r2 neg scored
    expect(aggregate.positive).toBe(1);
    expect(aggregate.negative).toBe(1);
  });
});

describe('baseline emotion classifier', () => {
  it('E-25/E-27: several emotions in one comment, or none', async () => {
    expect(await baselineEmotionClassifier.detect('I am frustrated and disappointed')).toHaveLength(2);
    expect(await baselineEmotionClassifier.detect('the sky is blue')).toHaveLength(0);
  });
});

describe('buildEmotionProfile (R-46)', () => {
  it('R-46: detects emotions per record and assembles the profile', async () => {
    const profile = await buildEmotionProfile(records, baselineEmotionClassifier);
    expect(profile.distribution.delight).toBe(1); // r1 "love"
    expect(profile.distribution.frustration).toBe(1); // r2 "frustrating"
    expect(profile.noEmotionDetected).toBe(1); // r3
    expect(profile.inferred).toBe(true);
  });
});
