/**
 * Emotion profile aggregation (v7 pillar). Built in Phase 4, increment 4.
 * Covers: E-25, E-26, E-27, INV-15, INV-16, D-17. (R-46 detection stays pending.)
 */
import { describe, it, expect } from 'vitest';
import {
  emotionProfile,
  rollUp,
  HEADLINE_EMOTIONS,
  EMOTION_RELATIONSHIP_KIND,
  type EmotionRead,
} from '../../src/domain/emotion';

const read = (headline: EmotionRead['headline'], confidence = 0.9): EmotionRead => ({
  headline,
  intensity: 0.7,
  confidence,
  source: 'inferred',
});

describe('taxonomy (D-17)', () => {
  it('D-17: compact headline set of seven emotions', () => {
    expect(HEADLINE_EMOTIONS).toHaveLength(7);
  });

  it('D-17: sub-emotions roll up to a headline emotion', () => {
    expect(rollUp('joy')).toBe('delight');
    expect(rollUp('Annoyance')).toBe('frustration');
    expect(rollUp('unmapped-thing')).toBeNull();
  });
});

describe('emotionProfile', () => {
  it('E-25: a record with several emotions contributes each, counted once', () => {
    const profile = emotionProfile([[read('pride'), read('relief')]]);
    expect(profile.distribution.pride).toBe(1);
    expect(profile.distribution.relief).toBe(1);
    expect(profile.readsCounted).toBe(2);
  });

  it('E-27: a record with no reads increments "no emotion detected", not a neutral emotion', () => {
    const profile = emotionProfile([[], [read('anger')]]);
    expect(profile.noEmotionDetected).toBe(1);
    expect(profile.distribution.anger).toBe(1);
  });

  it('E-26: reads below the confidence floor are excluded', () => {
    const profile = emotionProfile([[read('delight', 0.9), read('hope', 0.2)]], { confidenceFloor: 0.5 });
    expect(profile.distribution.delight).toBe(1);
    expect(profile.distribution.hope).toBe(0);
    expect(profile.lowConfidenceExcluded).toBe(1);
  });

  it('INV-15: the profile is always a labeled inferred companion signal', () => {
    const profile = emotionProfile([[read('pride')]]);
    expect(profile.inferred).toBe(true);
  });

  it('INV-16: emotion relates to Love/Trust by association, not causation', () => {
    expect(EMOTION_RELATIONSHIP_KIND).toBe('association');
  });
});
