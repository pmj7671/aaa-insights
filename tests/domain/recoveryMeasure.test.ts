/**
 * Recovery measurement. Built in Phase 4, increment 9.
 * Covers: R-38, O-15, E-20.
 */
import { describe, it, expect } from 'vitest';
import { recoveryDelta, cohortRecoveryRate } from '../../src/domain/recoveryMeasure';

describe('recoveryDelta (R-38)', () => {
  it('R-38: measures the before/after change and flags a measurable rise', () => {
    expect(recoveryDelta(2, 4)).toEqual({ status: 'measured', delta: 2, recovered: true });
    expect(recoveryDelta(4, 3)).toEqual({ status: 'measured', delta: -1, recovered: false });
  });

  it('E-20: a missing before/after read is "not yet measurable", never a change', () => {
    expect(recoveryDelta(null, 4)).toEqual({ status: 'not_yet_measurable' });
    expect(recoveryDelta(3, null)).toEqual({ status: 'not_yet_measurable' });
  });
});

describe('cohortRecoveryRate (R-38 / O-15)', () => {
  it('R-38/O-15: recovery_rate is the share of the cohort that measurably recovered', () => {
    const r = cohortRecoveryRate([2, 1, -1, -0.5, -2, 3], 5); // 3 of 6 > 0
    expect(r.status).toBe('measured');
    expect(r.total).toBe(6);
    expect(r.recovered).toBe(3);
    expect(r.rate).toBe(50);
  });

  it('E-20: below the minimum sample it is not yet measurable, not a fabricated rate', () => {
    const r = cohortRecoveryRate([2, 1], 5);
    expect(r.status).toBe('not_yet_measurable');
    expect(r.rate).toBeUndefined();
  });
});
