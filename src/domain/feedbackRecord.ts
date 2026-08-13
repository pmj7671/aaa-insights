/**
 * FeedbackRecord — the core unified record (one rating and/or comment about one
 * brand), and its attribution invariant.
 * Requirements: mirrors data model §12; INV-1 (every response is attributable to
 * exactly one source AND one brand — no response without a known origin).
 */
import type { BrandLoveRead, RatingScale } from './types.js';

export type SourceType = 'survey' | 'conversational' | 'import_csv' | 'web' | 'api' | 'provider';
export type RecordFlag = 'junk' | 'abuse' | 'safety' | 'low_confidence';

export interface FeedbackRecord {
  recordId: string;
  accountId: string;
  /** Exactly one brand (own or competitor) — INV-1. */
  brandId: string;
  /** Exactly one source — INV-1. */
  sourceId: string;
  sourceType: SourceType;
  /** When given/collected — ISO-8601, stored UTC (E-22). */
  capturedAt: string;
  ratingRaw?: number;
  ratingScale?: RatingScale;
  /** Normalised to 1..5, or null when un-mappable (E-15). */
  ratingNorm?: number | null;
  brandLove?: BrandLoveRead;
  trust?: number;
  commentText?: string;
  language?: string;
  segment?: string;
  provenance?: string;
  isComplete: boolean;
  flags: RecordFlag[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a record satisfies INV-1 and basic integrity. Returns an empty array
 * when valid. Enforces: a non-empty brand and source (exactly one each, which the
 * single-valued fields guarantee structurally), a known origin, and a valid UTC
 * timestamp.
 */
export function validateFeedbackRecord(r: FeedbackRecord): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!r.brandId || r.brandId.trim() === '') {
    errors.push({ field: 'brandId', message: 'a response must be attributable to exactly one brand (INV-1)' });
  }
  if (!r.sourceId || r.sourceId.trim() === '') {
    errors.push({ field: 'sourceId', message: 'a response must be attributable to exactly one source (INV-1)' });
  }
  if (!r.accountId || r.accountId.trim() === '') {
    errors.push({ field: 'accountId', message: 'a record must belong to an account' });
  }
  if (!r.capturedAt || Number.isNaN(Date.parse(r.capturedAt))) {
    errors.push({ field: 'capturedAt', message: 'capturedAt must be a valid timestamp' });
  }
  return errors;
}

/** Convenience predicate for INV-1 attribution. */
export function isAttributed(r: FeedbackRecord): boolean {
  return Boolean(r.brandId?.trim()) && Boolean(r.sourceId?.trim());
}
