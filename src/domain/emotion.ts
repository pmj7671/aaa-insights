/**
 * Emotion & experience (v7 pillar) — the emotion profile aggregation core and
 * the classifier seam.
 * Requirements: R-46/O-17 (emotion profile), R-47 (drill-down), D-17 (compact
 * headline set rolling up sub-emotions), E-25 (mixed emotions), E-26 (low
 * confidence excluded), E-27 (no signal), INV-15 (inferred companion, never
 * blended), INV-16 (distinct lens; association not causation).
 *
 * Detection is done by the AI classifier (the seam below), wired to the LLM
 * gateway later. This module owns the deterministic profile assembly.
 */
import { invariant } from './assert.js';

/** The compact, manager-readable headline taxonomy (~7) — D-17. */
export type HeadlineEmotion =
  | 'pride'
  | 'delight'
  | 'relief'
  | 'hope'
  | 'frustration'
  | 'disappointment'
  | 'anger';

export const HEADLINE_EMOTIONS: readonly HeadlineEmotion[] = [
  'pride',
  'delight',
  'relief',
  'hope',
  'frustration',
  'disappointment',
  'anger',
];

/** Finer sub-emotions roll up into a headline emotion (D-17, drill-down R-47). */
export const SUBEMOTION_ROLLUP: Readonly<Record<string, HeadlineEmotion>> = {
  joy: 'delight',
  gratitude: 'pride',
  reassurance: 'relief',
  anticipation: 'hope',
  optimism: 'hope',
  annoyance: 'frustration',
  irritation: 'frustration',
  anxiety: 'frustration',
  regret: 'disappointment',
  letdown: 'disappointment',
  rage: 'anger',
};

/**
 * An emotion read. Always `inferred` — emotion is never a stated headline metric
 * (INV-15). A comment may yield several reads (E-25) or none (E-27).
 */
export interface EmotionRead {
  headline: HeadlineEmotion;
  subEmotion?: string;
  /** 0..1 strength. */
  intensity: number;
  /** 0..1 model confidence (NFR-6). */
  confidence: number;
  readonly source: 'inferred';
}

/**
 * INV-16: emotion is a DISTINCT lens from Love/Trust/sentiment, and any link to
 * them is an association, not a cause. This label is attached wherever emotion is
 * related to another metric.
 */
export const EMOTION_RELATIONSHIP_KIND = 'association' as const;

/** The seam: an AI classifier detects emotions in open text (R-46). Wired later. */
export interface EmotionClassifier {
  detect(text: string): Promise<EmotionRead[]>;
}

/** Roll a sub-emotion up to its headline, if known. */
export function rollUp(subEmotion: string): HeadlineEmotion | null {
  return SUBEMOTION_ROLLUP[subEmotion.trim().toLowerCase()] ?? null;
}

export interface EmotionProfile {
  /** Count per headline emotion (each read counted once — E-25, INV-2). */
  distribution: Record<HeadlineEmotion, number>;
  /** Records with no readable affect — a distinct bucket, never a neutral emotion (E-27). */
  noEmotionDetected: number;
  /** Reads dropped for being below the confidence floor (E-26). */
  lowConfidenceExcluded: number;
  /** Total reads counted into the distribution. */
  readsCounted: number;
  /** Always true — the whole profile is a labeled companion signal (INV-15). */
  readonly inferred: true;
}

export const DEFAULT_CONFIDENCE_FLOOR = 0.5;

function emptyDistribution(): Record<HeadlineEmotion, number> {
  return { pride: 0, delight: 0, relief: 0, hope: 0, frustration: 0, disappointment: 0, anger: 0 };
}

/**
 * Assemble a per-brand emotion profile from per-record emotion reads.
 *
 * Input is one entry per record (a record may carry several reads — E-25 — or
 * an empty array when no affect was detected — E-27). Rules:
 *  - a record with no reads increments `noEmotionDetected` (never a neutral emotion);
 *  - reads below the confidence floor are excluded (E-26);
 *  - each surviving read is counted once in its headline bucket (E-25, INV-2);
 *  - the result is always flagged `inferred` — a companion signal that is never
 *    blended into the stated Brand Love / Trust Index (INV-15).
 */
export function emotionProfile(
  perRecord: readonly (readonly EmotionRead[])[],
  opts: { confidenceFloor?: number } = {},
): EmotionProfile {
  const floor = opts.confidenceFloor ?? DEFAULT_CONFIDENCE_FLOOR;
  invariant(floor >= 0 && floor <= 1, `confidence floor must be 0..1, got ${floor}`);

  const distribution = emptyDistribution();
  let noEmotionDetected = 0;
  let lowConfidenceExcluded = 0;
  let readsCounted = 0;

  for (const reads of perRecord) {
    const usable = reads.filter((r) => {
      invariant(r.confidence >= 0 && r.confidence <= 1, `confidence must be 0..1, got ${r.confidence}`);
      invariant(r.source === 'inferred', 'emotion reads are always inferred (INV-15)');
      return r.confidence >= floor;
    });
    lowConfidenceExcluded += reads.length - usable.length;
    if (usable.length === 0) {
      noEmotionDetected += 1; // E-27: no signal, not a fabricated neutral
      continue;
    }
    for (const r of usable) {
      distribution[r.headline] += 1; // E-25: each of several emotions counted once
      readsCounted += 1;
    }
  }

  return { distribution, noEmotionDetected, lowConfidenceExcluded, readsCounted, inferred: true };
}
