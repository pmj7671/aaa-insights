/**
 * Brand Trust — the stated-only net Trust Index and driver breakdown.
 * Requirements: R-31, R-32, O-12, INV-12, INV-14.
 */
import { invariant } from './assert.js';
import type { TrustRead } from './types.js';

export interface TrustIndexResult {
  /** Net trust = %positive − %negative over STATED reads, in [-100, 100]; null if none. */
  index: number | null;
  statedCount: number;
  inferredExcluded: number;
}

const POSITIVE_FLOOR = 4; // 4–5 = positive
const NEGATIVE_CEIL = 2; // 1–2 = negative; 3 = neutral

/**
 * Net Trust Index from mixed reads. Like Brand Love, this is **stated-only**:
 * inferred trust is a labeled companion signal and is excluded here (INV-14).
 */
export function trustIndex(reads: readonly TrustRead[]): TrustIndexResult {
  let positive = 0;
  let negative = 0;
  let statedCount = 0;
  let inferredExcluded = 0;

  for (const read of reads) {
    if (read.source === 'inferred') {
      inferredExcluded += 1;
      continue;
    }
    invariant(
      read.value >= 1 && read.value <= 5,
      `trust value must be normalised to 1..5, got ${read.value}`,
    );
    statedCount += 1;
    if (read.value >= POSITIVE_FLOOR) positive += 1;
    else if (read.value <= NEGATIVE_CEIL) negative += 1;
  }

  if (statedCount === 0) {
    return { index: null, statedCount: 0, inferredExcluded };
  }

  const index = Math.round(((positive - negative) / statedCount) * 100);
  invariant(index >= -100 && index <= 100, `Trust Index out of range: ${index}`);
  return { index, statedCount, inferredExcluded };
}
