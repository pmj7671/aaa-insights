/**
 * Baseline (deterministic) aspect extractor — a real implementation of the
 * AspectExtractor seam. Detects a configurable set of aspects by keyword and
 * assigns polarity from the surrounding sentiment words. Production swaps in the
 * Claude-backed extractor behind the SAME interface.
 * Requirements: supports R-48.
 */
import type { AspectExtractor, AspectRead, AspectPolarity } from './aspects.js';

/** Account-configurable aspect taxonomy (default set). */
export const DEFAULT_ASPECTS: Readonly<Record<string, readonly string[]>> = {
  product_quality: ['quality', 'product', 'feature', 'reliable', 'buggy', 'broken'],
  price_value: ['price', 'cost', 'expensive', 'cheap', 'value', 'worth', 'pricing'],
  support: ['support', 'service', 'help', 'agent', 'response', 'rep'],
  delivery: ['delivery', 'shipping', 'arrived', 'shipment'],
  ease_of_use: ['easy', 'intuitive', 'confusing', 'complicated', 'simple'],
};

const POSITIVE = ['great', 'good', 'love', 'excellent', 'fast', 'reliable', 'easy', 'helpful', 'cheap', 'worth', 'intuitive', 'simple'];
const NEGATIVE = ['bad', 'terrible', 'slow', 'broken', 'buggy', 'expensive', 'confusing', 'complicated', 'poor', 'awful', 'unreliable'];

function polarityOf(text: string): AspectPolarity | null {
  const t = text.toLowerCase();
  const pos = POSITIVE.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const neg = NEGATIVE.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return null; // no clear polarity — not a strength or a gripe
}

export function makeBaselineAspectExtractor(
  taxonomy: Readonly<Record<string, readonly string[]>> = DEFAULT_ASPECTS,
): AspectExtractor {
  return {
    async extract(inputs) {
      const reads: AspectRead[] = [];
      for (const { recordId, text } of inputs) {
        const t = text.toLowerCase();
        const polarity = polarityOf(text);
        if (!polarity) continue;
        for (const [aspect, keywords] of Object.entries(taxonomy)) {
          if (keywords.some((k) => t.includes(k))) {
            reads.push({ recordId, aspect, polarity, intensity: 0.7, confidence: 0.8, quote: text });
          }
        }
      }
      return reads;
    },
  };
}

export const baselineAspectExtractor: AspectExtractor = makeBaselineAspectExtractor();
