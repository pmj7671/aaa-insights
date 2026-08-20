/**
 * The Application API — the single front door (per docs/architecture_overview.md).
 *
 * `createApp(deps)` returns a `handle(req)` function that routes a request to the
 * right endpoint over the repositories and domain logic. Tenant isolation (INV-6) is
 * enforced at the transport edge: the account is taken from the URL path, and a write
 * is stamped with that account — a caller cannot post into a tenant other than the one
 * in the URL. Deleted ids cannot be re-created (INV-7 → 409).
 *
 * Endpoints in this first vertical slice:
 *   GET  /health
 *   POST /accounts/:accountId/feedback      ingest one response (validated)
 *   GET  /accounts/:accountId/feedback      list an account's responses
 *   POST /accounts/:accountId/query         grounded "ask your data" NL query (R-17)
 */
import type { FeedbackRecord, SourceType, RecordFlag } from '../domain/feedbackRecord.js';
import { validateFeedbackRecord } from '../domain/feedbackRecord.js';
import type { BrandLoveRead } from '../domain/types.js';
import type { Competitor } from '../domain/competitors.js';
import { answerQuery, baselineAnswerer, type GroundedAnswerer } from '../domain/nlQuery.js';
import { buildInsightReport } from '../domain/reportService.js';
import { toCsv } from '../domain/exportCsv.js';
import { authorize, login, SessionManager, type IdentityProvider, type AdminRole } from '../domain/auth.js';
import type {
  FeedbackRepository,
  RecoveryCaseRepository,
  ContactRepository,
  CompetitorRepository,
} from '../persistence/ports.js';
import { Router } from './router.js';
import type { HttpResponse } from './http.js';
import { ok, created, badRequest, conflict, notFound, unauthorized, forbidden, text, json } from './http.js';
import type { Handler } from './http.js';

const EXPORT_COLUMNS = [
  'recordId', 'brandId', 'sourceId', 'sourceType', 'capturedAt',
  'ratingNorm', 'brandLove', 'trust', 'segment', 'commentText',
] as const;

/** Admin auth wiring (R-42). When present, admin routes require a valid session. */
export interface AuthDeps {
  idp: IdentityProvider;
  sessions: SessionManager;
  /** Mints an opaque session token (CSPRNG in production; deterministic in tests). */
  mintToken: (nowMs: number) => string;
  ttlMs?: number;
}

export interface AppDeps {
  feedback: FeedbackRepository;
  /** Optional aggregate stores; their routes register only when wired in. */
  cases?: RecoveryCaseRepository;
  contacts?: ContactRepository;
  competitors?: CompetitorRepository;
  /** Phrasing seam for the NL query; defaults to the deterministic baseline. */
  answerer?: GroundedAnswerer;
  /** Admin auth (R-42). When omitted, admin routes are open (respondent/dev mode). */
  auth?: AuthDeps;
  /** Clock seam for session expiry; defaults to Date.now. */
  now?: () => number;
}

export interface App {
  handle(req: {
    method: string;
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): Promise<HttpResponse>;
}

function coerceRecord(accountId: string, body: unknown): { record?: FeedbackRecord; errors?: string[] } {
  const b = (typeof body === 'object' && body ? body : {}) as Record<string, unknown>;
  const str = (k: string): string | undefined => (typeof b[k] === 'string' ? (b[k] as string) : undefined);

  const recordId = str('recordId');
  const sourceType = str('sourceType');
  if (!recordId || !sourceType) {
    const errors: string[] = [];
    if (!recordId) errors.push('recordId is required');
    if (!sourceType) errors.push('sourceType is required');
    return { errors };
  }

  const record: FeedbackRecord = {
    recordId,
    accountId, // INV-6: forced from the URL path, never from the body
    brandId: str('brandId') ?? '',
    sourceId: str('sourceId') ?? '',
    sourceType: sourceType as SourceType,
    capturedAt: str('capturedAt') ?? '',
    isComplete: typeof b.isComplete === 'boolean' ? b.isComplete : false,
    flags: Array.isArray(b.flags) ? (b.flags as RecordFlag[]) : [],
  };
  if (typeof b.commentText === 'string') record.commentText = b.commentText;
  if (typeof b.ratingNorm === 'number') record.ratingNorm = b.ratingNorm;
  if (typeof b.brandLove === 'string') record.brandLove = b.brandLove as BrandLoveRead;
  if (typeof b.trust === 'number') record.trust = b.trust;
  if (typeof b.segment === 'string') record.segment = b.segment;
  if (typeof b.provenance === 'string') record.provenance = b.provenance;

  const vErrors = validateFeedbackRecord(record).map((e) => `${e.field}: ${e.message}`);
  if (vErrors.length > 0) return { errors: vErrors };
  return { record };
}

function coerceCompetitor(brandId: string, body: unknown): { competitor?: Competitor; errors?: string[] } {
  const b = (typeof body === 'object' && body ? body : {}) as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name : undefined;
  if (!name) return { errors: ['name is required'] };
  const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const competitor: Competitor = {
    brandId, // INV-6/id: taken from the URL, never the body
    name,
    aliases: strings(b.aliases),
    tracked: typeof b.tracked === 'boolean' ? b.tracked : true,
  };
  const products = strings(b.products);
  if (products.length > 0) competitor.products = products;
  return { competitor };
}

export function createApp(deps: AppDeps): App {
  const router = new Router();
  const now = deps.now ?? (() => Date.now());
  const bearer = (req: { headers: Record<string, string> }): string => {
    const h = req.headers.authorization ?? '';
    return h.startsWith('Bearer ') ? h.slice(7) : '';
  };

  /**
   * Wrap an admin handler so it requires a valid, MFA-satisfied session with at least
   * `required` role, scoped to the URL's account (R-42, INV-6). With no auth wired, the
   * handler is returned unguarded (respondent/dev mode) — respondent endpoints stay open
   * regardless (INV-5).
   */
  const guarded = (handler: Handler, required: AdminRole = 'member'): Handler => {
    const auth = deps.auth;
    if (!auth) return handler;
    return async (req) => {
      const session = auth.sessions.validate(bearer(req), now());
      if (!session) return unauthorized();
      if (!authorize(session, required)) return forbidden('admin role and satisfied MFA required');
      const acct = req.params.accountId;
      if (acct && session.accountId !== acct) return forbidden('session is not scoped to this account');
      return handler(req);
    };
  };

  // Admin routes require at least Member (view analysis, R-21); config writes require Admin.
  const addGuarded = (m: string, p: string, h: Handler) => router.add(m, p, guarded(h));
  const addGuardedAdmin = (m: string, p: string, h: Handler) => router.add(m, p, guarded(h, 'admin'));

  router.add('GET', '/health', async () => ok({ status: 'ok' }));

  if (deps.auth) {
    const auth = deps.auth;
    router.add('POST', '/auth/login', async (req) => {
      const b = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
      const assertion = typeof b.assertion === 'string' ? b.assertion : '';
      if (!assertion) return badRequest('assertion is required');
      const token = auth.mintToken(now());
      const res = login(auth.idp, auth.sessions, assertion, token, now(), auth.ttlMs);
      if (!res.ok) {
        return res.reason === 'mfa_required' ? unauthorized('MFA challenge required') : unauthorized('SSO assertion could not be verified');
      }
      return ok({ token: res.session.token, expiresAtMs: res.session.expiresAtMs, roles: res.session.roles, accountId: res.session.accountId });
    });
    router.add('POST', '/auth/logout', async (req) => {
      auth.sessions.revoke(bearer(req));
      return ok({ loggedOut: true });
    });
    router.add('GET', '/auth/session', async (req) => {
      const s = auth.sessions.validate(bearer(req), now());
      return s ? ok({ userId: s.userId, accountId: s.accountId, roles: s.roles, expiresAtMs: s.expiresAtMs }) : unauthorized();
    });
  }

  router.add('POST', '/accounts/:accountId/feedback', async (req) => {
    const accountId = req.params.accountId ?? '';
    const { record, errors } = coerceRecord(accountId, req.body);
    if (errors || !record) return badRequest('invalid feedback record', { details: errors ?? [] });
    const stored = await deps.feedback.save(record);
    if (!stored) return conflict('record id was previously deleted and cannot be re-created (INV-7)');
    return created({ stored: true, recordId: record.recordId });
  });

  addGuarded('GET', '/accounts/:accountId/feedback', async (req) => {
    const accountId = req.params.accountId ?? '';
    const records = await deps.feedback.list(accountId);
    return ok({ records, count: records.length });
  });

  addGuarded('POST', '/accounts/:accountId/query', async (req) => {
    const accountId = req.params.accountId ?? '';
    const b = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
    const query = typeof b.query === 'string' ? b.query.trim() : '';
    if (!query) return badRequest('query is required');
    const records = await deps.feedback.list(accountId); // INV-6: only this account's data
    const answer = await answerQuery(records, accountId, query, deps.answerer ?? baselineAnswerer);
    return ok(answer);
  });

  // Insight report (R-18) — a read projection over the account's records. Brand label
  // and optional own-brand filter come from the query string.
  addGuarded('GET', '/accounts/:accountId/report', async (req) => {
    const accountId = req.params.accountId ?? '';
    const records = await deps.feedback.list(accountId);
    const brandName = req.query.brand ?? 'Your brand';
    const ownBrandId = req.query.ownBrandId;
    const report = buildInsightReport(records, ownBrandId ? { brandName, ownBrandId } : { brandName });
    return ok(report);
  });

  // CSV export of the account's responses (R-22). Returns text/csv, not JSON.
  addGuarded('GET', '/accounts/:accountId/export', async (req) => {
    const accountId = req.params.accountId ?? '';
    const records = await deps.feedback.list(accountId);
    const rows = records.map((r) => ({
      recordId: r.recordId, brandId: r.brandId, sourceId: r.sourceId, sourceType: r.sourceType,
      capturedAt: r.capturedAt, ratingNorm: r.ratingNorm ?? '', brandLove: r.brandLove ?? '',
      trust: r.trust ?? '', segment: r.segment ?? '', commentText: r.commentText ?? '',
    }));
    return text(200, toCsv(rows, EXPORT_COLUMNS), 'text/csv');
  });

  // Recovery cases — read-only over the API (cases are opened by the recovery engine,
  // not posted in). Register literal paths before the :caseId param so 'open' matches.
  const cases = deps.cases;
  if (cases) {
    addGuarded('GET', '/accounts/:accountId/cases/open', async (req) => {
      const list = await cases.listOpen(req.params.accountId ?? ''); // DPS-5 view
      return ok({ cases: list, count: list.length });
    });
    addGuarded('GET', '/accounts/:accountId/cases', async (req) => {
      const list = await cases.list(req.params.accountId ?? '');
      return ok({ cases: list, count: list.length });
    });
    addGuarded('GET', '/accounts/:accountId/cases/:caseId', async (req) => {
      const found = await cases.get(req.params.accountId ?? '', req.params.caseId ?? '');
      return found ? ok(found) : notFound('case not found');
    });
  }

  // Contacts — read plus delete (the E-17 consent purge / DSR path). Creation flows
  // through the consented collection path in the domain, not a raw write here.
  const contacts = deps.contacts;
  if (contacts) {
    addGuarded('GET', '/accounts/:accountId/contacts', async (req) => {
      const list = await contacts.list(req.params.accountId ?? '');
      return ok({ contacts: list, count: list.length });
    });
    addGuarded('GET', '/accounts/:accountId/contacts/:contactId', async (req) => {
      const found = await contacts.get(req.params.accountId ?? '', req.params.contactId ?? '');
      return found ? ok(found) : notFound('contact not found');
    });
    addGuardedAdmin('DELETE', '/accounts/:accountId/contacts/:contactId', async (req) => {
      await contacts.delete(req.params.accountId ?? '', req.params.contactId ?? '');
      return ok({ deleted: true });
    });
  }

  // Competitors — full config CRUD; the account owns this configuration (R-24).
  const competitors = deps.competitors;
  if (competitors) {
    addGuarded('GET', '/accounts/:accountId/competitors/tracked', async (req) => {
      const list = await competitors.listTracked(req.params.accountId ?? ''); // R-24
      return ok({ competitors: list, count: list.length });
    });
    addGuarded('GET', '/accounts/:accountId/competitors', async (req) => {
      const list = await competitors.list(req.params.accountId ?? '');
      return ok({ competitors: list, count: list.length });
    });
    addGuarded('GET', '/accounts/:accountId/competitors/:brandId', async (req) => {
      const found = await competitors.get(req.params.accountId ?? '', req.params.brandId ?? '');
      return found ? ok(found) : notFound('competitor not found');
    });
    addGuardedAdmin('PUT', '/accounts/:accountId/competitors/:brandId', async (req) => {
      const { competitor, errors } = coerceCompetitor(req.params.brandId ?? '', req.body);
      if (errors || !competitor) return badRequest('invalid competitor', { details: errors ?? [] });
      await competitors.save(req.params.accountId ?? '', competitor);
      return ok({ saved: true, brandId: competitor.brandId });
    });
    addGuardedAdmin('DELETE', '/accounts/:accountId/competitors/:brandId', async (req) => {
      await competitors.delete(req.params.accountId ?? '', req.params.brandId ?? '');
      return ok({ deleted: true });
    });
  }

  return {
    async handle(req) {
      try {
        return await router.handle(req);
      } catch {
        return json(500, { error: 'internal error' });
      }
    },
  };
}
