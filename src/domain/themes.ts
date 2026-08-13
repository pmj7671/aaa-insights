/**
 * Theme analysis — assemble AI-discovered theme assignments into a summary with
 * counts, representative quotes, and traceability to the underlying records.
 * Requirements: R-14 (theme analysis with counts + quotes), O-2, and the
 * traceability spine (every theme opens its records — INV-3 / R-16).
 *
 * Theme *discovery* is done by the AI extractor (the seam below), wired to the
 * LLM gateway later. This module owns the deterministic aggregation.
 */
import { invariant } from './assert.js';
import { share } from './metrics.js';

export interface ThemeAssignment {
  recordId: string;
  themeId: string;
  label: string;
  /** 0..1 model confidence (NFR-6). */
  confidence: number;
  /** An optional representative verbatim from the record. */
  quote?: string;
}

export interface ThemeSummary {
  themeId: string;
  label: string;
  /** Distinct records assigned to this theme (each counted once — INV-2). */
  count: number;
  /** Share of the filtered set (%). */
  share: number;
  /** The records behind this theme — the traceability path (INV-3, R-16). */
  recordIds: string[];
  /** Up to `maxQuotes` representative verbatims, highest-confidence first. */
  representativeQuotes: string[];
}

/** The seam: an AI extractor discovers themes across texts (R-14). Wired later. */
export interface ThemeExtractor {
  extract(inputs: readonly { recordId: string; text: string }[]): Promise<ThemeAssignment[]>;
}

export const DEFAULT_CONFIDENCE_FLOOR = 0.5;
export const DEFAULT_MAX_QUOTES = 3;

/**
 * Aggregate theme assignments into per-theme summaries for a filtered set.
 * Low-confidence assignments are excluded; each record is counted once per theme;
 * every summary carries its recordIds so the client can open the exact underlying
 * responses (traceability). Summaries are ordered by count, descending.
 *
 * `total` is the size of the filtered set (distinct records) used for the share;
 * when omitted it defaults to the distinct records seen across all assignments.
 */
export function aggregateThemes(
  assignments: readonly ThemeAssignment[],
  opts: { total?: number; confidenceFloor?: number; maxQuotes?: number } = {},
): ThemeSummary[] {
  const floor = opts.confidenceFloor ?? DEFAULT_CONFIDENCE_FLOOR;
  const maxQuotes = opts.maxQuotes ?? DEFAULT_MAX_QUOTES;
  invariant(floor >= 0 && floor <= 1, `confidence floor must be 0..1, got ${floor}`);

  const usable = assignments.filter((a) => {
    invariant(a.confidence >= 0 && a.confidence <= 1, `confidence must be 0..1, got ${a.confidence}`);
    return a.confidence >= floor;
  });

  const allRecords = new Set(usable.map((a) => a.recordId));
  const total = opts.total ?? allRecords.size;

  interface Bucket {
    label: string;
    records: Set<string>;
    quotes: { quote: string; confidence: number }[];
  }
  const buckets = new Map<string, Bucket>();

  for (const a of usable) {
    let b = buckets.get(a.themeId);
    if (!b) {
      b = { label: a.label, records: new Set(), quotes: [] };
      buckets.set(a.themeId, b);
    }
    b.records.add(a.recordId); // dedup: one record counted once per theme
    if (a.quote) b.quotes.push({ quote: a.quote, confidence: a.confidence });
  }

  const summaries: ThemeSummary[] = [];
  for (const [themeId, b] of buckets) {
    const count = b.records.size;
    const representativeQuotes = b.quotes
      .sort((x, y) => y.confidence - x.confidence)
      .map((q) => q.quote)
      .filter((q, i, arr) => arr.indexOf(q) === i)
      .slice(0, maxQuotes);
    summaries.push({
      themeId,
      label: b.label,
      count,
      share: share(count, total),
      recordIds: [...b.records],
      representativeQuotes,
    });
  }

  return summaries.sort((a, b) => b.count - a.count);
}
