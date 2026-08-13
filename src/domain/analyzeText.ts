/**
 * Text analysis orchestration — assign a read to EACH open-text response, then
 * aggregate. Ties the classifier seams to the aggregation cores.
 * Requirements: R-15 (assign sentiment per response + aggregate), O-3;
 * R-46 (detect emotions per record → emotion profile), O-17.
 *
 * Classifier-agnostic: pass the baseline classifier or the Claude-backed one.
 */
import {
  aggregateSentiment,
  type Sentiment,
  type SentimentClassifier,
  type SentimentAggregate,
} from './sentiment.js';
import { emotionProfile, type EmotionClassifier, type EmotionProfile, type EmotionRead } from './emotion.js';

export interface TextRecord {
  recordId: string;
  text: string;
}

export interface SentimentAssignment {
  recordId: string;
  sentiment: Sentiment;
}

export interface SentimentAnalysis {
  assignments: SentimentAssignment[];
  aggregate: SentimentAggregate;
}

/**
 * Assign sentiment to each open-text response using the given classifier, then
 * aggregate the results (R-15). Every response gets a read; the aggregate applies
 * the confidence floor.
 */
export async function assignSentiment(
  records: readonly TextRecord[],
  classifier: SentimentClassifier,
  opts: { confidenceFloor?: number } = {},
): Promise<SentimentAnalysis> {
  const assignments: SentimentAssignment[] = [];
  for (const r of records) {
    assignments.push({ recordId: r.recordId, sentiment: await classifier.classify(r.text) });
  }
  const aggregate = aggregateSentiment(assignments.map((a) => a.sentiment), opts);
  return { assignments, aggregate };
}

/**
 * Detect emotions for each record and assemble the emotion profile (R-46). A
 * record may yield several emotions or none; the profile handles both.
 */
export async function buildEmotionProfile(
  records: readonly TextRecord[],
  classifier: EmotionClassifier,
  opts: { confidenceFloor?: number } = {},
): Promise<EmotionProfile> {
  const perRecord: EmotionRead[][] = [];
  for (const r of records) {
    perRecord.push([...(await classifier.detect(r.text))]);
  }
  return emotionProfile(perRecord, opts);
}
