/**
 * Admin auth & managed sessions. Built in Phase 4, increment 26. Covers R-42
 * (SSO/MFA + managed sessions) and the auth half of DPS-11.
 */
import { describe, it, expect } from 'vitest';
import {
  SessionManager,
  authorize,
  login,
  type AdminIdentity,
  type IdentityProvider,
} from '../../src/domain/auth';

const identity = (over: Partial<AdminIdentity> = {}): AdminIdentity => ({
  userId: 'u1', email: 'admin@acme.com', accountId: 'a1', roles: ['admin'], mfaSatisfied: true, ...over,
});

/** Deterministic SSO/MFA stub: known assertions map to identities. */
const stubIdp = (map: Record<string, AdminIdentity>): IdentityProvider => ({
  verify: (assertion) => map[assertion] ?? null,
});

const T0 = 1_000_000; // fixed clock base (ms)

describe('SessionManager (R-42 managed sessions)', () => {
  it('issues and validates a live session', () => {
    const sm = new SessionManager();
    const s = sm.issue(identity(), 'tok1', T0);
    expect(sm.validate('tok1', T0 + 1000)?.userId).toBe('u1');
    expect(s.expiresAtMs).toBeGreaterThan(s.issuedAtMs);
  });

  it('expires a session at its TTL', () => {
    const sm = new SessionManager(1000); // 1s TTL
    sm.issue(identity(), 'tok1', T0);
    expect(sm.validate('tok1', T0 + 999)).not.toBeNull();
    expect(sm.validate('tok1', T0 + 1000)).toBeNull(); // at expiry
  });

  it('revoke (logout) invalidates immediately; unknown tokens are null', () => {
    const sm = new SessionManager();
    sm.issue(identity(), 'tok1', T0);
    sm.revoke('tok1');
    expect(sm.validate('tok1', T0 + 1)).toBeNull();
    expect(sm.validate('nope', T0)).toBeNull();
  });

  it('revokeUser drops every session for a user', () => {
    const sm = new SessionManager();
    sm.issue(identity({ userId: 'u1' }), 'tokA', T0);
    sm.issue(identity({ userId: 'u1' }), 'tokB', T0);
    sm.issue(identity({ userId: 'u2' }), 'tokC', T0);
    sm.revokeUser('u1');
    expect(sm.validate('tokA', T0 + 1)).toBeNull();
    expect(sm.validate('tokB', T0 + 1)).toBeNull();
    expect(sm.validate('tokC', T0 + 1)).not.toBeNull();
  });
});

describe('authorize (R-42 role + MFA)', () => {
  it('grants when role suffices and MFA is satisfied', () => {
    const sm = new SessionManager();
    const s = sm.issue(identity({ roles: ['admin'], mfaSatisfied: true }), 'tok', T0);
    expect(authorize(s, 'admin')).toBe(true);
    expect(authorize(s, 'member')).toBe(true); // higher rank covers lower
  });

  it('denies without a satisfied MFA challenge, even with the role', () => {
    const sm = new SessionManager();
    const s = sm.issue(identity({ roles: ['owner'], mfaSatisfied: false }), 'tok', T0);
    expect(authorize(s, 'member')).toBe(false);
  });

  it('denies when the role is insufficient', () => {
    const sm = new SessionManager();
    const s = sm.issue(identity({ roles: ['member'], mfaSatisfied: true }), 'tok', T0);
    expect(authorize(s, 'admin')).toBe(false);
  });

  it('denies a null session', () => {
    expect(authorize(null, 'member')).toBe(false);
  });
});

describe('login (R-42 SSO + MFA flow)', () => {
  it('issues a session for a verified, MFA-satisfied assertion', () => {
    const idp = stubIdp({ 'good-sso': identity({ mfaSatisfied: true }) });
    const sm = new SessionManager();
    const res = login(idp, sm, 'good-sso', 'tok1', T0);
    expect(res.ok).toBe(true);
    if (res.ok) expect(sm.validate(res.session.token, T0 + 1)).not.toBeNull();
  });

  it('rejects an unverifiable assertion', () => {
    const res = login(stubIdp({}), new SessionManager(), 'forged', 'tok', T0);
    expect(res).toEqual({ ok: false, reason: 'unverified' });
  });

  it('requires MFA before a session is issued', () => {
    const idp = stubIdp({ 'no-mfa': identity({ mfaSatisfied: false }) });
    const sm = new SessionManager();
    const res = login(idp, sm, 'no-mfa', 'tok', T0);
    expect(res).toEqual({ ok: false, reason: 'mfa_required' });
    expect(sm.validate('tok', T0 + 1)).toBeNull(); // no session minted
  });
});
