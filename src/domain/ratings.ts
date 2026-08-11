/**
 * Rating normalisation — every scale mapped to a common 1..5 ordinal.
 * Requirements: E-15 (mixed scales), INV-2. Un-mappable ratings return null
 * and are excluded from cross-source averages (never guessed).
 */
import { invariant } from './assert.js';
import type { RatingScale } from './types.js';

/** Linear map of a value in [lo, hi] onto [1, 5]. */
function toFivePoint(value: number, lo: number, hi: number): number | null {
  if (Number.isNaN(value) || value < lo || value > hi) return null;
  const scaled = 1 + ((value - lo) / (hi - lo)) * 4;
  const rounded = Math.round(scaled * 100) / 100;
  invariant(rounded >= 1 && rounded <= 5, `normalised rating out of range: ${rounded}`);
  return rounded;
}

/**
 * Normalise a raw rating on a known scale to 1..5. Returns `null` for values
 * that cannot be mapped (out of range, or a non-numeric scale such as
 * brand_love/trust which are handled by their own modules) — the caller stores
 * the raw value and excludes it from cross-source averages (E-15).
 */
export function normalizeRating(raw: number, scale: RatingScale): number | null {
  switch (scale) {
    case '5_star':
      return toFivePoint(raw, 1, 5);
    case 'csat':
      return toFivePoint(raw, 1, 5);
    case '10_pt':
      return toFivePoint(raw, 1, 10);
    case 'nps':
      return toFivePoint(raw, 0, 10);
    case 'brand_love':
    case 'trust':
      // Handled by brandLove / trust modules, not the generic rating average.
      return null;
    default:
      return null;
  }
}

/** Average of the normalised ratings, excluding un-mappable (null) values (E-15). */
export function averageNormalized(values: readonly (number | null)[]): number | null {
  const mappable = values.filter((v): v is number => v != null);
  if (mappable.length === 0) return null;
  const mean = mappable.reduce((a, b) => a + b, 0) / mappable.length;
  return Math.round(mean * 100) / 100;
}
