/**
 * Opt-in contact & consent. Built in Phase 4, increment 9.
 * Covers: R-34, E-23, INV-13.
 */
import { describe, it, expect } from 'vitest';
import {
  collectContact,
  hasActiveConsent,
  withdrawConsent,
  canContact,
  type ContactInput,
} from '../../src/domain/contact';

const input: ContactInput = {
  contactId: 'ct1',
  respondentRef: 'resp1',
  channel: 'email',
  value: 'x@example.com',
  consentScope: 'service_recovery',
  consentAt: '2026-08-11T10:00:00Z',
};

describe('collectContact (R-34, E-23)', () => {
  it('R-34: an of-age respondent can opt in; the contact is first-party', () => {
    const result = collectContact(input, true);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.contact.origin).toBe('first_party');
  });

  it('E-23: a respondent under the age threshold is refused contact collection', () => {
    const result = collectContact(input, false);
    expect(result).toEqual({ ok: false, reason: 'under_age_threshold' });
  });
});

describe('consent gating (INV-13)', () => {
  it('INV-13: contact is allowed only with active, in-scope consent', () => {
    const { contact } = collectContact(input, true) as { ok: true; contact: import('../../src/domain/contact').Contact };
    expect(hasActiveConsent(contact, 'service_recovery')).toBe(true);
    expect(hasActiveConsent(contact, 'marketing')).toBe(false); // out of scope
    expect(canContact(contact, 'service_recovery')).toBe(true);
  });

  it('INV-13: withdrawing consent stops contact', () => {
    const { contact } = collectContact(input, true) as { ok: true; contact: import('../../src/domain/contact').Contact };
    const withdrawn = withdrawConsent(contact, '2026-08-12T09:00:00Z');
    expect(withdrawn.withdrawnAt).toBe('2026-08-12T09:00:00Z');
    expect(canContact(withdrawn, 'service_recovery')).toBe(false);
  });
});
