/**
 * Report assembly — compose the insight report (R-18) from an account's stored
 * responses. This is the bridge between the raw FeedbackRecords and the domain's
 * `assembleInsightReport`: it derives the stated-only Brand Love and Trust indices
 * (the same discipline enforced in brandLove.ts / trust.ts — inferred reads never
 * blended into the headline) and hands them to the assembler.
 *
 * Kept deliberately to the stated Love/Trust core here; theme/aspect/sentiment
 * enrichment (which runs through the classifier seams) layers in without changing
 * this signature.
 */
import type { FeedbackRecord } from './feedbackRecord.js';
import type { LoveRead, TrustRead } from './types.js';
import { brandLoveIndex } from './brandLove.js';
import { trustIndex } from './trust.js';
import { assembleInsightReport, type InsightReport } from './insightReport.js';

export interface ReportOptions {
  brandName: string;
  /** When set, restrict the report to this brand's records (e.g. the own brand). */
  ownBrandId?: string;
}

export function buildInsightReport(records: readonly FeedbackRecord[], opts: ReportOptions): InsightReport {
  const scoped = opts.ownBrandId ? records.filter((r) => r.brandId === opts.ownBrandId) : records;

  const loveReads: LoveRead[] = [];
  const trustReads: TrustRead[] = [];
  for (const r of scoped) {
    if (r.brandLove !== undefined) loveReads.push({ label: r.brandLove, source: 'stated' });
    // Guard the 1..5 range so malformed data yields "no data", not a thrown invariant.
    if (typeof r.trust === 'number' && r.trust >= 1 && r.trust <= 5) {
      trustReads.push({ value: r.trust, source: 'stated' });
    }
  }

  const love = brandLoveIndex(loveReads);
  const trust = trustIndex(trustReads);
  return assembleInsightReport({
    brandName: opts.brandName,
    brandLoveIndex: love.index,
    trustIndex: trust.index,
  });
}
