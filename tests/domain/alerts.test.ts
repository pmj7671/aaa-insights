/**
 * Alerts. Built in Phase 4, increment 7.
 * Covers: R-20, O-7.
 */
import { describe, it, expect } from 'vitest';
import { evaluateAlert, evaluateAlerts, crosses, type AlertRule } from '../../src/domain/alerts';

describe('crosses', () => {
  it('R-20: above fires at/over the threshold; below fires at/under', () => {
    expect(crosses(30, 25, 'above')).toBe(true);
    expect(crosses(20, 25, 'above')).toBe(false);
    expect(crosses(10, 20, 'below')).toBe(true);
    expect(crosses(25, 20, 'below')).toBe(false);
  });
});

describe('evaluateAlert (R-20)', () => {
  const rule: AlertRule = { id: 'a1', signal: 'neg_sentiment_share', threshold: 25, direction: 'above' };

  it('R-20: fires with an event when the signal crosses', () => {
    const event = evaluateAlert(rule, 40);
    expect(event).toMatchObject({ ruleId: 'a1', signal: 'neg_sentiment_share', value: 40 });
  });

  it('R-20: does not fire below threshold, when disabled, or when the value is null', () => {
    expect(evaluateAlert(rule, 10)).toBeNull();
    expect(evaluateAlert({ ...rule, enabled: false }, 40)).toBeNull();
    expect(evaluateAlert(rule, null)).toBeNull();
  });
});

describe('evaluateAlerts', () => {
  it('R-20: evaluates a set of rules against a snapshot of signal values', () => {
    const rules: AlertRule[] = [
      { id: 'neg', signal: 'neg_sentiment_share', threshold: 25, direction: 'above' },
      { id: 'love', signal: 'brand_love_index', threshold: 0, direction: 'below' },
      { id: 'trust', signal: 'trust_index', threshold: 0, direction: 'below' },
    ];
    const events = evaluateAlerts(rules, { neg_sentiment_share: 30, brand_love_index: 10, trust_index: -5 });
    expect(events.map((e) => e.ruleId).sort()).toEqual(['neg', 'trust']);
  });
});
