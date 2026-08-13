/**
 * Recovery measurement — did acting on a case actually rebuild the relationship?
 * Requirements: R-38 (re-measure Brand Love / Trust before vs. after resolution
 * for a consented customer; report at cohort level), O-15, E-20 (too few
 * responses to re-measure → "not yet measurable", never a fabricated improvement).
 */
import { share } from './metrics.js';

export type RecoveryStatus = 'measured' | 'not_yet_measurable';

export interface DeltaResult {
  status: RecoveryStatus;
  /** after − before, on the same normalised scale; present only when measured. */
  delta?: number;
  /** true when the relationship measurably rose. */
  recovered?: boolean;
}

/**
 * Per-customer recovery delta: the change in a relationship read (Love or Trust)
 * before vs. after resolution. If either read is missing, recovery is
 * "not yet measurable" — never scored as a change (E-20).
 */
export function recoveryDelta(before: number | null, after: number | null): DeltaResult {
  if (before == null || after == null) return { status: 'not_yet_measurable' };
  const delta = Math.round((after - before) * 100) / 100;
  return { status: 'measured', delta, recovered: delta > 0 };
}

export interface CohortResult {
  status: RecoveryStatus;
  total: number;
  recovered?: number;
  /** % of the cohort that measurably recovered (the recovery_rate — O-15). */
  rate?: number;
}

export const DEFAULT_MIN_SAMPLE = 5;

/**
 * Cohort recovery rate: the share of consented customers whose relationship
 * measurably rose. Below the minimum sample it is "not yet measurable" (E-20) —
 * recovery_rate is defined on MEASURED recovery, reported separately from case
 * closure (O-15).
 */
export function cohortRecoveryRate(deltas: readonly number[], minSample = DEFAULT_MIN_SAMPLE): CohortResult {
  if (deltas.length < minSample) return { status: 'not_yet_measurable', total: deltas.length };
  const recovered = deltas.filter((d) => d > 0).length;
  return { status: 'measured', total: deltas.length, recovered, rate: share(recovered, deltas.length) };
}
