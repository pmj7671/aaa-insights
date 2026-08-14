/**
 * Product boundaries — the v1 exclusions, encoded as explicit guards so "the
 * system will not do X" is enforceable and testable, not just documented.
 * Requirements: X-1…X-7.
 *
 * The RecoveryCase (consented, first-party) is the sole identity-linked exception
 * to X-1 (see recovery.ts / INV-9).
 */

/** X-1: no general identity-resolved profile (RecoveryCase aside). */
export function buildsGeneralIdentityProfile(): boolean {
  return false;
}

/** X-2: v1 pushes no customer data to external CRM/helpdesk and ships no native workbench. */
export function pushesToExternalTools(): boolean {
  return false;
}

/** X-4: v1 makes no prediction of future churn/revenue outcomes. */
export function predictsFutureOutcomes(): boolean {
  return false;
}

/** X-5: there is no public respondent panel / audience marketplace. */
export function offersRespondentPanel(): boolean {
  return false;
}

/** X-6: the product is evidence-backed decision support, not a replacement for judgment. */
export function isDecisionSupportOnly(): boolean {
  return true;
}

/** X-7: scraped reviewers are never re-identified, contacted, or profiled. */
export function reidentifiesScrapedReviewers(): boolean {
  return false;
}
