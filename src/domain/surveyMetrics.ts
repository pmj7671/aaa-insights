/**
 * Core survey metrics — rates, NPS, CSAT.
 * Requirements: R-19, O-4, INV-2. Computed only when the questions qualify;
 * pure arithmetic with the counting invariants enforced via `share`.
 */
import { invariant } from './assert.js';
import { share } from './metrics.js';

/** Response rate = responses / invitations (%). */
export function responseRate(responses: number, invitations: number): number {
  return share(responses, invitations);
}

/** Completion rate = completed / started (%). */
export function completionRate(completed: number, started: number): number {
  return share(completed, started);
}

export interface NpsResult {
  /** Net Promoter Score in [-100, 100]. */
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}

/**
 * NPS from 0–10 scores: %promoters (9–10) − %detractors (0–6).
 * Values outside 0–10 are rejected (the question must be a proper 0–10 item).
 */
export function nps(scores: readonly number[]): NpsResult | null {
  if (scores.length === 0) return null;
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  for (const s of scores) {
    invariant(Number.isFinite(s) && s >= 0 && s <= 10, `NPS score must be 0..10, got ${s}`);
    if (s >= 9) promoters += 1;
    else if (s >= 7) passives += 1;
    else detractors += 1;
  }
  const total = scores.length;
  const value = Math.round(share(promoters, total) - share(detractors, total));
  invariant(value >= -100 && value <= 100, `NPS out of range: ${value}`);
  return { nps: value, promoters, passives, detractors, total };
}

/**
 * CSAT as top-2-box on a 1–5 scale: share of respondents rating 4 or 5 (%).
 * Values outside 1–5 are rejected.
 */
export function csat(scores: readonly number[]): number | null {
  if (scores.length === 0) return null;
  let satisfied = 0;
  for (const s of scores) {
    invariant(Number.isFinite(s) && s >= 1 && s <= 5, `CSAT score must be 1..5, got ${s}`);
    if (s >= 4) satisfied += 1;
  }
  return share(satisfied, scores.length);
}
