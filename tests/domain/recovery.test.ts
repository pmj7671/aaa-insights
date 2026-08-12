/**
 * Closed-loop / recovery domain. Built in Phase 4, increment 5.
 * Covers: R-35, R-36, R-40, E-19, E-21, and the D-C/INV-9 case-kind boundary.
 */
import { describe, it, expect } from 'vitest';
import {
  isDissatisfaction,
  caseKindFor,
  canTransition,
  transition,
  openOrGroup,
  prioritize,
  isStale,
  type DissatisfactionSignal,
  type RecoveryCase,
} from '../../src/domain/recovery';

const signal = (over: Partial<DissatisfactionSignal>): DissatisfactionSignal => ({
  recordId: 'r1',
  origin: 'first_party',
  ...over,
});

const openCase = (over: Partial<RecoveryCase>): RecoveryCase => ({
  id: 'c1',
  recordIds: ['r1'],
  kind: 'anonymous_triage',
  status: 'open',
  groupingKey: 'r1',
  openedAt: '2026-08-11T10:00:00Z',
  ...over,
});

describe('trigger evaluation (R-35)', () => {
  it('R-35: opens on Dislike/Hate, low trust, At-risk, or a low rating', () => {
    expect(isDissatisfaction(signal({ brandLove: 'hate' }))).toBe(true);
    expect(isDissatisfaction(signal({ trust: 2 }))).toBe(true);
    expect(isDissatisfaction(signal({ quadrant: 'at_risk' }))).toBe(true);
    expect(isDissatisfaction(signal({ rating: 1 }))).toBe(true);
  });

  it('R-35: does not open on satisfied signals', () => {
    expect(isDissatisfaction(signal({ brandLove: 'love', trust: 5, rating: 5 }))).toBe(false);
  });
});

describe('case-kind boundary (D-C / INV-9)', () => {
  it('only a consented first-party respondent yields a contactable case', () => {
    expect(caseKindFor('first_party', true)).toBe('contactable');
    expect(caseKindFor('first_party', false)).toBe('anonymous_triage');
    expect(caseKindFor('public', true)).toBe('anonymous_triage');
    expect(caseKindFor('competitor', true)).toBe('anonymous_triage');
  });
});

describe('lifecycle (R-36)', () => {
  it('R-36: allows valid transitions and rejects illegal ones', () => {
    expect(canTransition('open', 'in_progress')).toBe(true);
    expect(canTransition('resolved', 'closed')).toBe(true);
    expect(canTransition('closed', 'open')).toBe(false);
    const c = openCase({});
    expect(transition(c, 'in_progress').status).toBe('in_progress');
    expect(() => transition({ ...c, status: 'closed' }, 'open')).toThrow(/illegal case transition/);
  });
});

describe('grouping / throttle (E-21)', () => {
  it('E-21: a second signal from the same customer groups into the open case, no duplicate', () => {
    const existing = openCase({ groupingKey: 'cust-9', customerRef: 'cust-9' });
    const result = openOrGroup([existing], signal({ recordId: 'r2', customerRef: 'cust-9', brandLove: 'hate' }), 'c2', '2026-08-11T11:00:00Z');
    expect(result?.grouped).toBe(true);
    expect(result?.case.recordIds).toEqual(['r1', 'r2']);
  });

  it('E-21: a new customer opens a fresh case', () => {
    const result = openOrGroup([], signal({ customerRef: 'cust-new', brandLove: 'hate' }), 'c3', '2026-08-11T11:00:00Z');
    expect(result?.grouped).toBe(false);
    expect(result?.case.status).toBe('open');
    expect(result?.case.openedAt).toBe('2026-08-11T11:00:00Z');
  });

  it('a non-dissatisfaction signal opens nothing', () => {
    expect(openOrGroup([], signal({ brandLove: 'love' }), 'c4', '2026-08-11T11:00:00Z')).toBeNull();
  });
});

describe('prioritisation (R-40)', () => {
  it('R-40: At-risk + low trust + volume rank above a mild case', () => {
    const mild = openCase({ id: 'mild', quadrant: 'dependable', recordIds: ['a'] });
    const urgent = openCase({ id: 'urgent', quadrant: 'at_risk', trust: 1, recordIds: ['a', 'b', 'c'] });
    const order = prioritize([mild, urgent]).map((c) => c.id);
    expect(order[0]).toBe('urgent');
  });
});

describe('stale-case escalation (E-19)', () => {
  it('E-19: an open case past its follow-up window is stale; a resolved one is not', () => {
    const c = openCase({ openedAt: '2026-08-01T10:00:00Z' });
    expect(isStale(c, '2026-08-05T10:00:00Z', 48)).toBe(true); // 96h > 48h
    expect(isStale(c, '2026-08-01T20:00:00Z', 48)).toBe(false); // 10h < 48h
    expect(isStale({ ...c, status: 'resolved' }, '2026-09-01T10:00:00Z', 48)).toBe(false);
  });
});
