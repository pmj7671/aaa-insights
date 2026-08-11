/**
 * Core domain types for AAA Insights. Mirrors the logical data model in
 * Requirements v7.1 §12. Kept infrastructure-free (no DB/GCP types) so the
 * analysis core is pure and testable.
 */

/** The Brand Love scale (stated). Ordinal 5→1. See R-1, R-30, D-9. */
export type BrandLoveLabel = 'love' | 'like' | 'ambivalence' | 'dislike' | 'hate';

/**
 * A Brand Love read as stored on a FeedbackRecord: a stated label, OR `unknown`
 * when a comment carries no readable Love signal. `unknown` is NEVER "ambivalence"
 * and is excluded from the Index denominator (INV-14, E-24, F-12).
 */
export type BrandLoveRead = BrandLoveLabel | 'unknown';

/** Ordinal mapping for the stated scale (INV-12: Love is its own indicator). */
export const BRAND_LOVE_ORDINAL: Record<BrandLoveLabel, number> = {
  love: 5,
  like: 4,
  ambivalence: 3,
  dislike: 2,
  hate: 1,
};

/**
 * Whether a read was **stated** by the respondent or **inferred** by AI from open
 * text. The headline Index is stated-only; inferred reads are a labeled companion
 * and are NEVER blended into a stated headline metric (INV-4, INV-14, INV-15).
 */
export type ReadSource = 'stated' | 'inferred';

export interface LoveRead {
  label: BrandLoveRead;
  source: ReadSource;
  /** 0..1 model confidence; present for inferred reads (NFR-6). */
  confidence?: number;
}

export interface TrustRead {
  /** Normalised 1..5 trust rating. */
  value: number;
  source: ReadSource;
  confidence?: number;
}

/** Rating scales the hub ingests; normalised to a common 1..5 (E-15). */
export type RatingScale = '5_star' | '10_pt' | 'nps' | 'csat' | 'brand_love' | 'trust';

/** Minimal shape used for de-duplication (R-13, E-6). */
export interface DedupeKeyed {
  sourceId: string;
  text: string;
  /** ISO-8601 timestamp, stored UTC (E-22). */
  capturedAt: string;
}
