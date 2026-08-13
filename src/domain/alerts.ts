/**
 * Alerts — fire a notification when a monitored signal crosses a threshold.
 * Requirements: R-20, O-7.
 */
import { invariant } from './assert.js';

export type AlertSignal =
  | 'neg_sentiment_share'
  | 'avg_rating'
  | 'brand_love_index'
  | 'trust_index';

export type Direction = 'above' | 'below';

export interface AlertRule {
  id: string;
  signal: AlertSignal;
  threshold: number;
  /** Fire when the value is at/above ('above') or at/below ('below') the threshold. */
  direction: Direction;
  enabled?: boolean;
}

export interface AlertEvent {
  ruleId: string;
  signal: AlertSignal;
  value: number;
  threshold: number;
  direction: Direction;
}

/** Whether a value crosses the rule's threshold in its configured direction. */
export function crosses(value: number, threshold: number, direction: Direction): boolean {
  return direction === 'above' ? value >= threshold : value <= threshold;
}

/**
 * Evaluate a rule against the current signal value. Returns an AlertEvent when it
 * fires, or null. A disabled rule, or a null value (metric not computable), never
 * fires.
 */
export function evaluateAlert(rule: AlertRule, value: number | null): AlertEvent | null {
  if (rule.enabled === false) return null;
  if (value == null || Number.isNaN(value)) return null;
  invariant(Number.isFinite(rule.threshold), 'alert threshold must be a finite number');
  if (!crosses(value, rule.threshold, rule.direction)) return null;
  return { ruleId: rule.id, signal: rule.signal, value, threshold: rule.threshold, direction: rule.direction };
}

/** Evaluate many rules against a snapshot of signal values (R-20). */
export function evaluateAlerts(
  rules: readonly AlertRule[],
  values: Readonly<Partial<Record<AlertSignal, number | null>>>,
): AlertEvent[] {
  const events: AlertEvent[] = [];
  for (const rule of rules) {
    const event = evaluateAlert(rule, values[rule.signal] ?? null);
    if (event) events.push(event);
  }
  return events;
}
