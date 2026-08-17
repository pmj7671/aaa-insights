/**
 * Admin authentication & managed sessions (R-42; the auth half of DPS-11).
 *
 * Admins sign in through an external identity provider (SSO) that also runs the MFA
 * challenge; the product never sees or stores a password. That provider is modeled
 * here as the `IdentityProvider` seam — a deterministic stub for tests, the real
 * Identity Platform in production — which returns a verified `AdminIdentity`. The
 * product then mints and manages its own bounded session (`SessionManager`), and
 * authorization checks both role and a satisfied MFA challenge.
 *
 * Respondents are never authenticated (INV-5) — this module governs the admin console
 * and admin API only.
 *
 * Time is injected (`nowMs`) rather than read from the clock, so session expiry is
 * deterministic and testable.
 */
export type AdminRole = 'owner' | 'admin' | 'member';

const ROLE_RANK: Record<AdminRole, number> = { member: 0, admin: 1, owner: 2 };

/** A verified admin identity, as asserted by the SSO/MFA identity provider. */
export interface AdminIdentity {
  userId: string;
  email: string;
  accountId: string;
  roles: AdminRole[];
  /** The IdP asserts the MFA challenge was satisfied for this sign-in (R-42). */
  mfaSatisfied: boolean;
}

/** A product-managed admin session. */
export interface Session {
  token: string;
  userId: string;
  accountId: string;
  roles: AdminRole[];
  mfaSatisfied: boolean;
  issuedAtMs: number;
  expiresAtMs: number;
}

/**
 * The SSO/MFA seam. Verifies an opaque assertion/token minted by the external identity
 * provider and returns the identity, or null when it cannot be verified. Production
 * binds this to Identity Platform; tests use a deterministic stub.
 */
export interface IdentityProvider {
  verify(assertion: string): AdminIdentity | null;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Issues, validates, and revokes bounded admin sessions (managed sessions, R-42). */
export class SessionManager {
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly defaultTtlMs: number = DEFAULT_TTL_MS) {}

  issue(identity: AdminIdentity, token: string, nowMs: number, ttlMs: number = this.defaultTtlMs): Session {
    const session: Session = {
      token,
      userId: identity.userId,
      accountId: identity.accountId,
      roles: [...identity.roles],
      mfaSatisfied: identity.mfaSatisfied,
      issuedAtMs: nowMs,
      expiresAtMs: nowMs + ttlMs,
    };
    this.sessions.set(token, session);
    return session;
  }

  /** Returns the live session, or null when unknown or expired (expired ones are purged). */
  validate(token: string, nowMs: number): Session | null {
    const s = this.sessions.get(token);
    if (!s) return null;
    if (nowMs >= s.expiresAtMs) {
      this.sessions.delete(token);
      return null;
    }
    return s;
  }

  /** Revoke a session (logout / forced sign-out). Idempotent. */
  revoke(token: string): void {
    this.sessions.delete(token);
  }

  /** Revoke every session for a user (e.g. on role change or account lock). */
  revokeUser(userId: string): void {
    for (const [token, s] of this.sessions) if (s.userId === userId) this.sessions.delete(token);
  }
}

/** Highest-ranked role in a session. */
function topRank(roles: readonly AdminRole[]): number {
  return roles.reduce((max, r) => Math.max(max, ROLE_RANK[r]), -1);
}

/**
 * Authorize a session for an action needing at least `required` role. Denies unless
 * MFA was satisfied AND the session carries a role at or above the requirement (R-42).
 */
export function authorize(session: Session | null, required: AdminRole): boolean {
  if (!session) return false;
  if (!session.mfaSatisfied) return false; // MFA is mandatory for admin actions (R-42)
  return topRank(session.roles) >= ROLE_RANK[required];
}

export type LoginResult =
  | { ok: true; session: Session }
  | { ok: false; reason: 'unverified' | 'mfa_required' };

/**
 * Complete an admin sign-in: verify the SSO assertion, require a satisfied MFA
 * challenge, then mint a managed session. `token` is supplied by the caller's secure
 * minter (a CSPRNG in production) so this stays deterministic and side-effect-free.
 */
export function login(
  idp: IdentityProvider,
  sessions: SessionManager,
  assertion: string,
  token: string,
  nowMs: number,
  ttlMs?: number,
): LoginResult {
  const identity = idp.verify(assertion);
  if (!identity) return { ok: false, reason: 'unverified' };
  if (!identity.mfaSatisfied) return { ok: false, reason: 'mfa_required' };
  return { ok: true, session: sessions.issue(identity, token, nowMs, ttlMs) };
}
