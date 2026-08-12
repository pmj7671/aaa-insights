/**
 * Closed-loop / service recovery — the internal RecoveryCase state machine and
 * trigger logic. Pure domain; the loop is owned and resolved inside the product
 * (no external CRM push — D-E, X-2).
 * Requirements: R-35 (triggers), R-36 (lifecycle), R-40 (prioritise),
 * E-19 (stale case), E-21 (grouping/throttle), and the D-C / INV-9 boundary
 * (contactable only for consented first-party; public/competitor → anonymous).
 */
import { invariant } from './assert.js';
import type { BrandLoveRead } from './types.js';
import type { Quadrant } from './segmentation.js';

export type CaseStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type CaseKind = 'contactable' | 'anonymous_triage';
export type ResponseOrigin = 'first_party' | 'public' | 'competitor';

/** Allowed lifecycle transitions (R-36). `closed` is terminal. */
const TRANSITIONS: Record<CaseStatus, readonly CaseStatus[]> = {
  open: ['in_progress', 'resolved', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed', 'in_progress'], // reopen if recovery isn't confirmed
  closed: [],
};

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface DissatisfactionSignal {
  recordId: string;
  origin: ResponseOrigin;
  /** First-party opt-in consent to be contacted (INV-13). */
  consented?: boolean;
  /** Groups a customer's signals into one case (E-21). */
  customerRef?: string;
  brandLove?: BrandLoveRead;
  /** Normalised 1..5. */
  trust?: number;
  quadrant?: Quadrant;
  /** Normalised 1..5. */
  rating?: number;
}

export interface TriggerThresholds {
  ratingFloor: number;
  trustFloor: number;
}
export const DEFAULT_TRIGGER_THRESHOLDS: TriggerThresholds = { ratingFloor: 2, trustFloor: 2 };

/**
 * Whether a signal represents dissatisfaction that should open a case (R-35):
 * Dislike/Hate, low trust, the At-risk quadrant, or a rating at/below the floor.
 */
export function isDissatisfaction(
  signal: DissatisfactionSignal,
  t: TriggerThresholds = DEFAULT_TRIGGER_THRESHOLDS,
): boolean {
  if (signal.brandLove === 'dislike' || signal.brandLove === 'hate') return true;
  if (signal.trust != null && signal.trust <= t.trustFloor) return true;
  if (signal.quadrant === 'at_risk') return true;
  if (signal.rating != null && signal.rating <= t.ratingFloor) return true;
  return false;
}

/**
 * The kind of case a signal may open (D-C, INV-9): a **contactable** case only
 * for a consented first-party respondent; every public/competitor review — and
 * any un-consented response — is **anonymous internal-triage** only, never
 * individual outreach.
 */
export function caseKindFor(origin: ResponseOrigin, consented = false): CaseKind {
  return origin === 'first_party' && consented ? 'contactable' : 'anonymous_triage';
}

export interface RecoveryCase {
  id: string;
  recordIds: string[];
  kind: CaseKind;
  status: CaseStatus;
  groupingKey: string;
  openedAt: string; // ISO-8601 UTC
  customerRef?: string;
  ownerId?: string;
  quadrant?: Quadrant;
  trust?: number;
}

/** The key that collapses a customer's / incident's signals into one case (E-21). */
export function groupingKeyFor(signal: DissatisfactionSignal): string {
  return signal.customerRef ?? signal.recordId;
}

/** Transition a case to a new status, enforcing the lifecycle (R-36). */
export function transition(current: RecoveryCase, to: CaseStatus): RecoveryCase {
  invariant(canTransition(current.status, to), `illegal case transition ${current.status} → ${to}`);
  return { ...current, status: to };
}

export interface OpenResult {
  case: RecoveryCase;
  grouped: boolean;
}

/**
 * Open a new case for a dissatisfaction signal, OR group it into an existing
 * still-open case with the same grouping key (E-21) — so a viral event or one
 * customer's repeated responses never spawn duplicate cases / outreach.
 * Returns null when the signal isn't a dissatisfaction (nothing to open).
 */
export function openOrGroup(
  openCases: readonly RecoveryCase[],
  signal: DissatisfactionSignal,
  newId: string,
  openedAt: string,
  thresholds: TriggerThresholds = DEFAULT_TRIGGER_THRESHOLDS,
): OpenResult | null {
  if (!isDissatisfaction(signal, thresholds)) return null;
  const key = groupingKeyFor(signal);
  const existing = openCases.find(
    (c) => (c.status === 'open' || c.status === 'in_progress') && c.groupingKey === key,
  );
  if (existing) {
    return { case: { ...existing, recordIds: [...existing.recordIds, signal.recordId] }, grouped: true };
  }
  const created: RecoveryCase = {
    id: newId,
    recordIds: [signal.recordId],
    kind: caseKindFor(signal.origin, signal.consented),
    status: 'open',
    groupingKey: key,
    openedAt,
    ...(signal.customerRef !== undefined ? { customerRef: signal.customerRef } : {}),
    ...(signal.quadrant !== undefined ? { quadrant: signal.quadrant } : {}),
    ...(signal.trust !== undefined ? { trust: signal.trust } : {}),
  };
  return { case: created, grouped: false };
}

/**
 * Prioritise open cases by predicted value/risk (R-40): At-risk quadrant and low
 * trust weigh most, then the volume of linked records. Returns a new array,
 * highest priority first.
 */
export function prioritize(cases: readonly RecoveryCase[]): RecoveryCase[] {
  const score = (c: RecoveryCase): number => {
    let s = c.recordIds.length; // volume
    if (c.quadrant === 'at_risk') s += 100;
    else if (c.quadrant === 'infatuated') s += 40;
    if (c.trust != null && c.trust <= 2) s += 50;
    return s;
  };
  return [...cases].sort((a, b) => score(b) - score(a));
}

/**
 * Whether an open/in-progress case is stale — past its follow-up window — and
 * should be escalated (E-19). `now` and `openedAt` are ISO-8601 UTC strings.
 */
export function isStale(caseRecord: RecoveryCase, now: string, windowHours: number): boolean {
  if (caseRecord.status === 'resolved' || caseRecord.status === 'closed') return false;
  const ageMs = Date.parse(now) - Date.parse(caseRecord.openedAt);
  invariant(!Number.isNaN(ageMs), 'openedAt and now must be valid timestamps');
  return ageMs > windowHours * 3_600_000;
}
