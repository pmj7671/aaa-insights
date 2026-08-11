/**
 * Brand Love — scale handling and the stated-only Brand Love Index.
 * Requirements: R-30, O-11, INV-4, INV-14, E-24, F-12 (v6/v7.1).
 */
import { invariant } from './assert.js';
import {
  BRAND_LOVE_ORDINAL,
  type BrandLoveLabel,
  type BrandLoveRead,
  type LoveRead,
} from './types.js';

const LABELS: readonly BrandLoveLabel[] = ['love', 'like', 'ambivalence', 'dislike', 'hate'];

/** Common spellings/synonyms map onto the canonical scale. */
const SYNONYMS: Record<string, BrandLoveLabel> = {
  love: 'love',
  like: 'like',
  ambivalence: 'ambivalence',
  ambivalent: 'ambivalence',
  neutral: 'ambivalence',
  dislike: 'dislike',
  hate: 'hate',
};

/**
 * Classify a raw label into a stated read, or `unknown` when it can't be read.
 * An unreadable / empty / unrecognised value is `unknown` — NEVER coerced to
 * `ambivalence` (INV-14, F-12).
 */
export function normalizeLoveLabel(raw: string | null | undefined): BrandLoveRead {
  if (raw == null) return 'unknown';
  const key = raw.trim().toLowerCase();
  if (key === '') return 'unknown';
  return SYNONYMS[key] ?? 'unknown';
}

/** Ordinal for a stated label; `unknown` has no ordinal (null). */
export function loveOrdinal(read: BrandLoveRead): number | null {
  return read === 'unknown' ? null : BRAND_LOVE_ORDINAL[read];
}

export interface BrandLoveIndexResult {
  /** %(Love+Like) − %(Dislike+Hate) over STATED reads, in [-100, 100]; null if no stated reads. */
  index: number | null;
  /** Number of stated reads in the denominator (excludes unknown and all inferred). */
  statedCount: number;
  /** Stated reads that were `unknown` — excluded from the Index (E-24). */
  unknownCount: number;
  /** Inferred reads seen and deliberately excluded from the headline (INV-4, INV-14). */
  inferredExcluded: number;
  /** Count per stated label (each read counted once — INV-2). */
  distribution: Record<BrandLoveLabel, number>;
}

/**
 * Compute the stated-only Brand Love Index from a mixed set of reads.
 *
 * Rules enforced here (so the headline can never be corrupted):
 *  - inferred reads are excluded entirely (INV-4, INV-14) — they are a labeled
 *    companion signal elsewhere, never blended into this number;
 *  - `unknown` stated reads are excluded from the denominator (E-24, F-12);
 *  - `ambivalence` is a real stated read: it counts in the denominator but
 *    contributes 0 to the numerator;
 *  - with no stated reads, the Index is `null` ("no stated data"), never 0.
 */
export function brandLoveIndex(reads: readonly LoveRead[]): BrandLoveIndexResult {
  const distribution: Record<BrandLoveLabel, number> = {
    love: 0,
    like: 0,
    ambivalence: 0,
    dislike: 0,
    hate: 0,
  };

  let statedCount = 0;
  let unknownCount = 0;
  let inferredExcluded = 0;

  for (const read of reads) {
    if (read.source === 'inferred') {
      inferredExcluded += 1;
      continue; // INV-4 / INV-14: never blended into the stated headline
    }
    if (read.label === 'unknown') {
      unknownCount += 1;
      continue; // E-24: excluded from the denominator, not scored as ambivalence
    }
    distribution[read.label] += 1;
    statedCount += 1;
  }

  if (statedCount === 0) {
    return { index: null, statedCount: 0, unknownCount, inferredExcluded, distribution };
  }

  const loveLike = distribution.love + distribution.like;
  const dislikeHate = distribution.dislike + distribution.hate;
  const index = Math.round(((loveLike - dislikeHate) / statedCount) * 100);

  invariant(index >= -100 && index <= 100, `Brand Love Index out of range: ${index}`);
  const summed = LABELS.reduce((n, l) => n + distribution[l], 0);
  invariant(summed === statedCount, 'distribution must sum to statedCount (INV-2)');

  return { index, statedCount, unknownCount, inferredExcluded, distribution };
}
