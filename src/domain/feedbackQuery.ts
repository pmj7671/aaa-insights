/**
 * Feedback-hub query surface — filter the unified feedback, build the aggregate
 * unified-customer view, and per-competitor analysis.
 * Requirements: R-12 (all feedback queryable/filterable), R-26 (aggregate
 * unified-customer view WITHOUT an identity-linked profile — INV-9),
 * R-28 / R-29 (per-competitor aggregate, filterable, traceable to sources — INV-3).
 */
import type { FeedbackRecord, SourceType } from './feedbackRecord.js';

export interface FeedbackFilter {
  brandId?: string;
  sourceType?: SourceType;
  /** ISO-8601 inclusive lower/upper bound on capturedAt. */
  from?: string;
  to?: string;
  segment?: string;
  /** Bounds on the normalised 1..5 rating (records without a rating are excluded when a bound is set). */
  ratingMin?: number;
  ratingMax?: number;
}

/** Apply a filter to the unified feedback (R-12). Absent criteria don't constrain. */
export function applyFilter(records: readonly FeedbackRecord[], filter: FeedbackFilter): FeedbackRecord[] {
  const fromMs = filter.from ? Date.parse(filter.from) : undefined;
  const toMs = filter.to ? Date.parse(filter.to) : undefined;

  return records.filter((r) => {
    if (filter.brandId && r.brandId !== filter.brandId) return false;
    if (filter.sourceType && r.sourceType !== filter.sourceType) return false;
    if (filter.segment && r.segment !== filter.segment) return false;
    if (fromMs !== undefined && Date.parse(r.capturedAt) < fromMs) return false;
    if (toMs !== undefined && Date.parse(r.capturedAt) > toMs) return false;
    if (filter.ratingMin !== undefined || filter.ratingMax !== undefined) {
      if (r.ratingNorm == null) return false;
      if (filter.ratingMin !== undefined && r.ratingNorm < filter.ratingMin) return false;
      if (filter.ratingMax !== undefined && r.ratingNorm > filter.ratingMax) return false;
    }
    return true;
  });
}

export interface SegmentBucket {
  segment: string;
  count: number;
}

export interface UnifiedCustomerView {
  brandId: string;
  /** Population-level total — a count, never an individual identity. */
  total: number;
  segments: SegmentBucket[];
}

/**
 * Aggregate, cross-source unified-customer view for the own brand (R-26). It is
 * population-level only: counts grouped by segment, with NO identity-linked
 * profile of any individual (INV-9). Records with no segment fall under 'unknown'.
 */
export function unifiedCustomerView(
  records: readonly FeedbackRecord[],
  ownBrandId: string,
): UnifiedCustomerView {
  const own = records.filter((r) => r.brandId === ownBrandId);
  const bySegment = new Map<string, number>();
  for (const r of own) {
    const seg = r.segment ?? 'unknown';
    bySegment.set(seg, (bySegment.get(seg) ?? 0) + 1);
  }
  const segments = [...bySegment.entries()]
    .map(([segment, count]) => ({ segment, count }))
    .sort((a, b) => b.count - a.count);
  return { brandId: ownBrandId, total: own.length, segments };
}

export interface CompetitorAnalysis {
  brandId: string;
  total: number;
  /** The source records behind the analysis — traceability (R-29, INV-3). */
  recordIds: string[];
  segments: SegmentBucket[];
}

/**
 * Per-competitor aggregate analysis (R-28), filterable and traceable to its
 * source items (R-29). Aggregate only — never an individual profile (INV-9/INV-11).
 */
export function perCompetitorAnalysis(
  records: readonly FeedbackRecord[],
  competitorBrandId: string,
  filter: FeedbackFilter = {},
): CompetitorAnalysis {
  const scoped = applyFilter(records, { ...filter, brandId: competitorBrandId });
  const bySegment = new Map<string, number>();
  for (const r of scoped) {
    const seg = r.segment ?? 'unknown';
    bySegment.set(seg, (bySegment.get(seg) ?? 0) + 1);
  }
  const segments = [...bySegment.entries()]
    .map(([segment, count]) => ({ segment, count }))
    .sort((a, b) => b.count - a.count);
  return {
    brandId: competitorBrandId,
    total: scoped.length,
    recordIds: scoped.map((r) => r.recordId),
    segments,
  };
}
