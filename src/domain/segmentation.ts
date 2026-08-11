/**
 * Love × Trust segmentation — the four quadrants and the action for each.
 * Requirements: R-33, O-13, INV-12 (Love and Trust are distinct axes, never
 * collapsed into one score).
 */
import { invariant } from './assert.js';
import { countByCategory } from './metrics.js';

export type Level = 'high' | 'low';

export type Quadrant = 'devoted' | 'infatuated' | 'dependable' | 'at_risk';

export interface QuadrantInfo {
  quadrant: Quadrant;
  label: string;
  /** Recommended action for this quadrant (O-13). */
  action: string;
}

const QUADRANTS: Record<Quadrant, Omit<QuadrantInfo, 'quadrant'>> = {
  devoted: {
    label: 'Devoted',
    action: 'Advocates — protect and activate them.',
  },
  infatuated: {
    label: 'Infatuated (fragile)',
    action: 'Passion without a safety net — shore up reliability and transparency before a stumble triggers churn.',
  },
  dependable: {
    label: 'Dependable',
    action: 'Loyal by reliability, not emotion — deepen the relationship.',
  },
  at_risk: {
    label: 'At-risk',
    action: 'Churn risk and detractors — intervene or triage.',
  },
};

/** Derive a high/low level from a score against a threshold (>= is high). */
export function levelFrom(score: number, threshold: number): Level {
  return score >= threshold ? 'high' : 'low';
}

/**
 * Place a respondent/segment in a quadrant from their DISTINCT Love and Trust
 * levels. The two axes are never merged into a single score (INV-12).
 */
export function quadrantOf(love: Level, trust: Level): Quadrant {
  if (love === 'high' && trust === 'high') return 'devoted';
  if (love === 'high' && trust === 'low') return 'infatuated';
  if (love === 'low' && trust === 'high') return 'dependable';
  return 'at_risk';
}

/** The quadrant plus its recommended action (O-13). */
export function segment(love: Level, trust: Level): QuadrantInfo {
  const quadrant = quadrantOf(love, trust);
  return { quadrant, ...QUADRANTS[quadrant] };
}

export interface SegmentPoint {
  love: Level;
  trust: Level;
}

export interface SegmentDistribution {
  counts: Record<Quadrant, number>;
  total: number;
}

/**
 * Distribution of respondents/segments across the four quadrants, each counted
 * once (INV-2). Always returns all four keys, even when zero.
 */
export function segmentDistribution(points: readonly SegmentPoint[]): SegmentDistribution {
  const quadrants = points.map((p) => quadrantOf(p.love, p.trust));
  const { counts, total } = countByCategory<Quadrant>(quadrants);
  const full: Record<Quadrant, number> = {
    devoted: counts.devoted ?? 0,
    infatuated: counts.infatuated ?? 0,
    dependable: counts.dependable ?? 0,
    at_risk: counts.at_risk ?? 0,
  };
  const summed = full.devoted + full.infatuated + full.dependable + full.at_risk;
  invariant(summed === total, 'quadrant counts must sum to the total (INV-2)');
  return { counts: full, total };
}
