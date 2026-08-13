/**
 * PII detection & redaction. Built in Phase 4, increment 13.
 * Covers: R-44, INV-8.
 */
import { describe, it, expect } from 'vitest';
import { detectPii, redactPii, hasPii } from '../../src/domain/pii';

describe('redactPii (R-44 / INV-8)', () => {
  it('R-44: redacts email, phone, SSN, and credit card, counting each', () => {
    const text = 'Reach me at jane@example.com or 415-555-1234. SSN 123-45-6789, card 4111 1111 1111 1111.';
    const { redacted, found } = redactPii(text);
    expect(redacted).not.toMatch(/jane@example\.com/);
    expect(redacted).not.toMatch(/415-555-1234/);
    expect(redacted).not.toMatch(/123-45-6789/);
    expect(redacted).toContain('[REDACTED:EMAIL]');
    expect(found.email).toBe(1);
    expect(found.ssn).toBe(1);
    expect(found.phone).toBe(1);
    expect(found.credit_card).toBe(1);
  });

  it('INV-8: text with no PII is unchanged', () => {
    const clean = 'The support team was fast and helpful.';
    expect(redactPii(clean).redacted).toBe(clean);
    expect(hasPii(clean)).toBe(false);
  });

  it('detects an IP address', () => {
    expect(detectPii('server 10.0.12.5 was slow').some((m) => m.type === 'ip')).toBe(true);
  });
});
