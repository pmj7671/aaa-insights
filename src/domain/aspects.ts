/**
 * Strengths & Gripes — aspect-based pros/cons the customer names.
 * Requirements: R-48 / O-18 (extract aspects with polarity, volume, quotes,
 * ranked by volume and by association with Love/Trust — labeled association, not
 * causation), INV-16, E-26 (low-confidence excluded), and the traceability spine.
 *
 * Extraction is the AI's job (AspectExtractor seam); this module owns the
 * deterministic assembly into a Strengths & Gripes board.
 */
import { invariant } from './assert.js';

export type AspectPolarity = 'positive' | 'negative';

export interface AspectRead {
  recordId: string;
  aspect: string;
  polarity: AspectPolarity;
  intensity: number;
  confidence: number;
  quote?: string;
}

/** The seam: an AI extractor pulls aspects + polarity from comments (R-48). Wired later. */
export interface AspectExtractor {
  extract(inputs: readonly { recordId: string; text: string }[]): Promise<AspectRead[]>;
}

/** INV-16 / R-48: any link between an aspect and Love/Trust is an association, not a cause. */
export const RELATIONSHIP_KIND = 'association' as const;

export interface AspectSummary {
  aspect: string;
  /** Distinct records praising the aspect (a strength). */
  strengths: number;
  /** Distinct records criticising the aspect (a gripe). */
  gripes: number;
  /** Distinct records mentioning the aspect at all. */
  volume: number;
  /** strengths − gripes. */
  net: number;
  /** The records behind this aspect — traceability (INV-3). */
  recordIds: string[];
  representativeQuotes: string[];
}

export const DEFAULT_CONFIDENCE_FLOOR = 0.5;
export const DEFAULT_MAX_QUOTES = 3;

/**
 * Aggregate aspect reads into a Strengths & Gripes board. Low-confidence reads are
 * excluded (E-26); each record is counted once per (aspect, polarity); every row
 * carries its records for traceability; rows are ordered by volume, descending.
 */
export function aggregateAspects(
  reads: readonly AspectRead[],
  opts: { confidenceFloor?: number; maxQuotes?: number } = {},
): AspectSummary[] {
  const floor = opts.confidenceFloor ?? DEFAULT_CONFIDENCE_FLOOR;
  const maxQuotes = opts.maxQuotes ?? DEFAULT_MAX_QUOTES;
  invariant(floor >= 0 && floor <= 1, `confidence floor must be 0..1, got ${floor}`);

  interface Bucket {
    positives: Set<string>;
    negatives: Set<string>;
    all: Set<string>;
    quotes: { quote: string; confidence: number }[];
  }
  const buckets = new Map<string, Bucket>();

  for (const r of reads) {
    invariant(r.confidence >= 0 && r.confidence <= 1, `confidence must be 0..1, got ${r.confidence}`);
    if (r.confidence < floor) continue;
    let b = buckets.get(r.aspect);
    if (!b) {
      b = { positives: new Set(), negatives: new Set(), all: new Set(), quotes: [] };
      buckets.set(r.aspect, b);
    }
    b.all.add(r.recordId);
    if (r.polarity === 'positive') b.positives.add(r.recordId);
    else b.negatives.add(r.recordId);
    if (r.quote) b.quotes.push({ quote: r.quote, confidence: r.confidence });
  }

  const summaries: AspectSummary[] = [];
  for (const [aspect, b] of buckets) {
    const strengths = b.positives.size;
    const gripes = b.negatives.size;
    const representativeQuotes = b.quotes
      .sort((x, y) => y.confidence - x.confidence)
      .map((q) => q.quote)
      .filter((q, i, arr) => arr.indexOf(q) === i)
      .slice(0, maxQuotes);
    summaries.push({
      aspect,
      strengths,
      gripes,
      volume: b.all.size,
      net: strengths - gripes,
      recordIds: [...b.all],
      representativeQuotes,
    });
  }

  return summaries.sort((a, b) => b.volume - a.volume);
}

/** Extract aspects for a set of records, then assemble the board (R-48). */
export async function buildStrengthsAndGripes(
  records: readonly { recordId: string; text: string }[],
  extractor: AspectExtractor,
  opts: { confidenceFloor?: number; maxQuotes?: number } = {},
): Promise<AspectSummary[]> {
  const reads = await extractor.extract(records);
  return aggregateAspects(reads, opts);
}
