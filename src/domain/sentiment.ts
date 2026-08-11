/**
 * Sentiment — the aggregation core and the classifier seam.
 * Requirements: R-15 (assign + aggregate), O-3, E-26 (low-confidence excluded).
 *
 * The *assignment* of sentiment to a response is done by the AI classifier
 * (the seam below, wired to the LLM gateway in a later step). This module owns
 * the deterministic aggregation that turns per-response reads into a metric,
 * with a confidence floor so soft/ambiguous reads don't corrupt the headline.
 */
import { invariant } from './assert.js';
import { share } from './metrics.js';

export type Polarity = 'positive' | 'neutral' | 'negative';

export interface Sentiment {
  polarity: Polarity;
  /** 0..1 strength of the read. */
  intensity: number;
  /** 0..1 model confidence (NFR-6). */
  confidence: number;
}

/** The seam: an AI classifier assigns sentiment to open text (R-15). Wired later. */
export interface SentimentClassifier {
  classify(text: string): Promise<Sentiment>;
}

export interface SentimentAggregate {
  positive: number;
  neutral: number;
  negative: number;
  /** Reads at/above the confidence floor (the denominator). */
  scored: number;
  /** Reads dropped for being below the confidence floor (E-26). */
  lowConfidenceExcluded: number;
  /** Share of negative among scored reads (%), or null when nothing scored. */
  negativeShare: number | null;
}

export const DEFAULT_CONFIDENCE_FLOOR = 0.5;

/**
 * Aggregate per-response sentiment reads. Reads below the confidence floor are
 * excluded from the headline (E-26), not counted as neutral. With nothing above
 * the floor, shares are null rather than a fabricated zero.
 */
export function aggregateSentiment(
  reads: readonly Sentiment[],
  opts: { confidenceFloor?: number } = {},
): SentimentAggregate {
  const floor = opts.confidenceFloor ?? DEFAULT_CONFIDENCE_FLOOR;
  invariant(floor >= 0 && floor <= 1, `confidence floor must be 0..1, got ${floor}`);

  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let lowConfidenceExcluded = 0;

  for (const r of reads) {
    invariant(r.confidence >= 0 && r.confidence <= 1, `confidence must be 0..1, got ${r.confidence}`);
    if (r.confidence < floor) {
      lowConfidenceExcluded += 1;
      continue;
    }
    if (r.polarity === 'positive') positive += 1;
    else if (r.polarity === 'negative') negative += 1;
    else neutral += 1;
  }

  const scored = positive + neutral + negative;
  return {
    positive,
    neutral,
    negative,
    scored,
    lowConfidenceExcluded,
    negativeShare: scored === 0 ? null : share(negative, scored),
  };
}
