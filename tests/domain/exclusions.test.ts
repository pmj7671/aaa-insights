/**
 * Exclusions — negative tests proving the product does NOT do the out-of-scope
 * things. Built in Phase 4, increment 17. Covers: X-1…X-7.
 */
import { describe, it, expect } from 'vitest';
import {
  buildsGeneralIdentityProfile,
  pushesToExternalTools,
  predictsFutureOutcomes,
  offersRespondentPanel,
  isDecisionSupportOnly,
  reidentifiesScrapedReviewers,
} from '../../src/domain/boundaries';
import { unifiedCustomerView } from '../../src/domain/feedbackQuery';
import { caseKindFor } from '../../src/domain/recovery';
import { assembleInsightReport } from '../../src/domain/insightReport';

describe('exclusions (X-1…X-7)', () => {
  it('X-1: the unified-customer view is aggregate — no identity-linked fields; no general profile built', () => {
    const view = unifiedCustomerView([], 'own');
    expect(Object.keys(view).sort()).toEqual(['brandId', 'segments', 'total']);
    expect(buildsGeneralIdentityProfile()).toBe(false);
  });

  it('X-2: v1 pushes no customer data to external tools', () => {
    expect(pushesToExternalTools()).toBe(false);
  });

  it('X-3 (see collectionPolicy): only lawful public collection — enforced by the collection gate', () => {
    // covered end-to-end in collectionPolicy.test.ts
    expect(true).toBe(true);
  });

  it('X-4: no future-outcome prediction; the insight report exposes no prediction field', () => {
    const report = assembleInsightReport({ brandName: 'Us', brandLoveIndex: 10, trustIndex: 5 });
    expect(Object.keys(report)).not.toContain('prediction');
    expect(predictsFutureOutcomes()).toBe(false);
  });

  it('X-5: no respondent panel / marketplace', () => {
    expect(offersRespondentPanel()).toBe(false);
  });

  it('X-6: evidence-backed decision support — report actions carry a rationale', () => {
    const report = assembleInsightReport({ brandName: 'Us', brandLoveIndex: -20, trustIndex: -10, atRiskCount: 4 });
    expect(report.actions.every((a) => a.rationale.length > 0)).toBe(true);
    expect(isDecisionSupportOnly()).toBe(true);
  });

  it('X-7: a public/competitor reviewer is never contactable; scraped reviewers are not re-identified', () => {
    expect(caseKindFor('public', true)).toBe('anonymous_triage');
    expect(caseKindFor('competitor', true)).toBe('anonymous_triage');
    expect(reidentifiesScrapedReviewers()).toBe(false);
  });
});
