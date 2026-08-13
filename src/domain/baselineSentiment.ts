/**
 * Baseline (deterministic) sentiment classifier — a real implementation of the
 * SentimentClassifier seam. Rule/lexicon based, so it runs anywhere with no model
 * and gives reproducible results for tests and offline use. Production swaps in
 * the Claude-backed classifier (via the LLM gateway) behind the SAME interface.
 * Requirements: supports R-15.
 */
import type { Sentiment, SentimentClassifier } from './sentiment.js';

const POSITIVE = [
  'love', 'great', 'excellent', 'good', 'amazing', 'happy', 'delight',
  'fantastic', 'wonderful', 'helpful', 'fast', 'reliable', 'easy', 'best',
];
const NEGATIVE = [
  'hate', 'terrible', 'bad', 'awful', 'poor', 'slow', 'broken', 'frustrat',
  'disappoint', 'angry', 'worst', 'unreliable', 'buggy', 'confusing', 'expensive',
];

function countHits(text: string, words: readonly string[]): number {
  const t = text.toLowerCase();
  return words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
}

export const baselineSentimentClassifier: SentimentClassifier = {
  async classify(text: string): Promise<Sentiment> {
    const pos = countHits(text, POSITIVE);
    const neg = countHits(text, NEGATIVE);
    const total = pos + neg;

    let polarity: Sentiment['polarity'] = 'neutral';
    if (pos > neg) polarity = 'positive';
    else if (neg > pos) polarity = 'negative';

    const intensity = total === 0 ? 0 : Math.min(1, Math.abs(pos - neg) / total);
    // No lexicon signal → low confidence (so the aggregation floor can drop it).
    const confidence = total === 0 ? 0.3 : Math.min(1, 0.5 + total * 0.15);

    return { polarity, intensity, confidence };
  },
};
