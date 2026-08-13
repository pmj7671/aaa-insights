/**
 * Opt-in contact & consent for first-party follow-up.
 * Requirements: R-34 (opt-in, age-gated, never required), INV-13 (follow-up is
 * consent-gated and withdrawable), E-23 (a respondent under the age threshold is
 * refused contact collection — anonymous response is still allowed elsewhere).
 *
 * Contact exists ONLY for first-party respondents; scraped/public reviewers are
 * never contacted (X-7, INV-11), which is why `origin` is fixed to 'first_party'.
 */
export interface Contact {
  contactId: string;
  respondentRef: string;
  channel: 'email' | 'sms' | 'phone';
  value: string;
  /** The purpose the respondent consented to, e.g. 'service_recovery' (DPS-10). */
  consentScope: string;
  consentAt: string; // ISO-8601 UTC
  withdrawnAt?: string;
  readonly origin: 'first_party';
}

export interface ContactInput {
  contactId: string;
  respondentRef: string;
  channel: Contact['channel'];
  value: string;
  consentScope: string;
  consentAt: string;
}

export type CollectResult =
  | { ok: true; contact: Contact }
  | { ok: false; reason: 'under_age_threshold' };

/**
 * Collect an opt-in contact. Refused when the respondent is not of age (E-23).
 * Contact is always optional at the survey level (R-34) — this only runs when a
 * respondent chooses to provide it.
 */
export function collectContact(input: ContactInput, isOfAge: boolean): CollectResult {
  if (!isOfAge) return { ok: false, reason: 'under_age_threshold' };
  return { ok: true, contact: { ...input, origin: 'first_party' } };
}

/** Active consent = present, matching the purpose, and not withdrawn (INV-13). */
export function hasActiveConsent(contact: Contact, scope: string): boolean {
  return !contact.withdrawnAt && contact.consentScope === scope;
}

/** Withdraw consent at a given time — reversible-by-the-respondent, not deleted here (INV-13, E-17). */
export function withdrawConsent(contact: Contact, at: string): Contact {
  return { ...contact, withdrawnAt: at };
}

/** Whether the company may contact this respondent for a purpose (INV-13). */
export function canContact(contact: Contact, scope: string): boolean {
  return contact.origin === 'first_party' && hasActiveConsent(contact, scope);
}
