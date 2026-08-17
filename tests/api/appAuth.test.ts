/**
 * Application API — admin auth guard (R-42). Phase 4, increment 26.
 * Verifies login/logout, session-protected admin routes, role tiers, tenant scoping,
 * expiry, and that respondent endpoints stay public (INV-5).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, type App, type AuthDeps } from '../../src/api/app';
import { MemoryFeedbackRepository } from '../../src/persistence/memoryFeedbackRepository';
import { MemoryCompetitorRepository } from '../../src/persistence/memoryCompetitorRepository';
import { SessionManager, type AdminIdentity, type IdentityProvider } from '../../src/domain/auth';

const T0 = 1_000_000;

const identities: Record<string, AdminIdentity> = {
  'sso-admin': { userId: 'u1', email: 'a@acme.com', accountId: 'a1', roles: ['admin'], mfaSatisfied: true },
  'sso-member': { userId: 'u2', email: 'm@acme.com', accountId: 'a1', roles: ['member'], mfaSatisfied: true },
  'sso-nomfa': { userId: 'u3', email: 'n@acme.com', accountId: 'a1', roles: ['admin'], mfaSatisfied: false },
};
const idp: IdentityProvider = { verify: (a) => identities[a] ?? null };

const auth = (over: Partial<AuthDeps> = {}): AuthDeps => {
  let n = 0;
  return { idp, sessions: new SessionManager(1000), mintToken: () => `tok-${++n}`, ...over };
};

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

async function tokenFor(app: App, assertion: string): Promise<string> {
  const res = await app.handle({ method: 'POST', path: '/auth/login', body: { assertion } });
  return (res.body as { token: string }).token;
}

describe('Application API — admin auth (R-42)', () => {
  let app: App;
  let clock: number;
  let competitors: MemoryCompetitorRepository;

  beforeEach(() => {
    clock = T0;
    competitors = new MemoryCompetitorRepository();
    app = createApp({
      feedback: new MemoryFeedbackRepository(),
      competitors,
      auth: auth(),
      now: () => clock,
    });
  });

  it('login issues a token for a verified, MFA-satisfied SSO assertion', async () => {
    const res = await app.handle({ method: 'POST', path: '/auth/login', body: { assertion: 'sso-admin' } });
    expect(res.status).toBe(200);
    expect((res.body as { token: string }).token).toBe('tok-1');
  });

  it('login is rejected without MFA (401) and for a forged assertion (401)', async () => {
    expect((await app.handle({ method: 'POST', path: '/auth/login', body: { assertion: 'sso-nomfa' } })).status).toBe(401);
    expect((await app.handle({ method: 'POST', path: '/auth/login', body: { assertion: 'forged' } })).status).toBe(401);
  });

  it('an admin route is 401 without a session, 200 with one', async () => {
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=X' })).status).toBe(401);
    const token = await tokenFor(app, 'sso-member');
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=X', headers: bearer(token) });
    expect(res.status).toBe(200);
  });

  it('a config write needs Admin: Member is 403, Admin is 200', async () => {
    const memberTok = await tokenFor(app, 'sso-member');
    const put = (t: string) => app.handle({ method: 'PUT', path: '/accounts/a1/competitors/rival', body: { name: 'Rival' }, headers: bearer(t) });
    expect((await put(memberTok)).status).toBe(403);
    const adminTok = await tokenFor(app, 'sso-admin');
    expect((await put(adminTok)).status).toBe(200);
  });

  it('INV-6: a session for one account cannot reach another account (403)', async () => {
    const token = await tokenFor(app, 'sso-admin'); // scoped to a1
    const res = await app.handle({ method: 'GET', path: '/accounts/a2/report?brand=X', headers: bearer(token) });
    expect(res.status).toBe(403);
  });

  it('logout revokes the session; the next call is 401', async () => {
    const token = await tokenFor(app, 'sso-admin');
    await app.handle({ method: 'POST', path: '/auth/logout', headers: bearer(token) });
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=X', headers: bearer(token) })).status).toBe(401);
  });

  it('an expired session is 401 (managed-session TTL)', async () => {
    const token = await tokenFor(app, 'sso-admin');
    clock = T0 + 1000; // reach the 1s TTL
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=X', headers: bearer(token) })).status).toBe(401);
  });

  it('GET /auth/session reflects the live session and 401 after expiry', async () => {
    const token = await tokenFor(app, 'sso-admin');
    expect((await app.handle({ method: 'GET', path: '/auth/session', headers: bearer(token) })).status).toBe(200);
    clock = T0 + 1000;
    expect((await app.handle({ method: 'GET', path: '/auth/session', headers: bearer(token) })).status).toBe(401);
  });

  it('INV-5: respondent feedback submission stays public (no token needed)', async () => {
    const res = await app.handle({
      method: 'POST', path: '/accounts/a1/feedback',
      body: { recordId: 'r1', brandId: 'b1', sourceId: 's1', sourceType: 'survey', capturedAt: '2026-08-01T00:00:00.000Z', isComplete: true },
    });
    expect(res.status).toBe(201);
  });
});
