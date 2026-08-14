/**
 * Lawful collection gate. Built in Phase 4, increment 17.
 * Covers: R-25, DPS-7, X-3, INV-10.
 */
import { describe, it, expect } from 'vitest';
import { collectionDecision, type CollectionSource } from '../../src/domain/collectionPolicy';

const web = (over: Partial<CollectionSource> = {}): CollectionSource => ({
  type: 'web',
  isPublic: true,
  requiresAuth: false,
  isPaywalled: false,
  robotsAllowed: true,
  termsAllow: true,
  legalSignoff: true,
  ...over,
});

describe('collectionDecision (R-25 / DPS-7 / X-3)', () => {
  it('R-25: a public web source with legal sign-off is allowed', () => {
    expect(collectionDecision(web())).toEqual({ allow: true });
  });

  it('X-3: private, auth-required, or paywalled web sources are denied', () => {
    expect(collectionDecision(web({ isPublic: false })).allow).toBe(false);
    expect(collectionDecision(web({ requiresAuth: true })).allow).toBe(false);
    expect(collectionDecision(web({ isPaywalled: true })).allow).toBe(false);
  });

  it('DPS-7: robots.txt / terms / missing legal sign-off block web collection', () => {
    expect(collectionDecision(web({ robotsAllowed: false })).allow).toBe(false);
    expect(collectionDecision(web({ termsAllow: false })).allow).toBe(false);
    const noSignoff = collectionDecision(web({ legalSignoff: false }));
    expect(noSignoff.allow).toBe(false);
    if (!noSignoff.allow) expect(noSignoff.reason).toMatch(/legal sign-off/i);
  });

  it('R-25: licensed provider / CSV are allowed when terms permit', () => {
    expect(collectionDecision({ type: 'provider', isPublic: true, requiresAuth: false, isPaywalled: false, robotsAllowed: true, termsAllow: true, legalSignoff: false }).allow).toBe(true);
    expect(collectionDecision({ type: 'import_csv', isPublic: true, requiresAuth: false, isPaywalled: false, robotsAllowed: true, termsAllow: false, legalSignoff: false }).allow).toBe(false);
  });
});
