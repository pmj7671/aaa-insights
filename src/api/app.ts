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
import { answerQuery, baselineAnswerer, type GroundedAnswerer } from '../domain/nlQuery.js';
import type { FeedbackRepository } from '../persistence/ports.js';
import { Router } from './router.js';
import type { HttpResponse } from './http.js';
import { ok, created, badRequest, conflict, json } from './http.js';

export interface AppDeps {
  feedback: FeedbackRepository;
  /** Phrasing seam for the NL query; defaults to the deterministic baseline. */
  answerer?: GroundedAnswerer;
}

export interface App {
  handle(req: { method: string; path: string; body?: unknown }): Promise<HttpResponse>;
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

export function createApp(deps: AppDeps): App {
  const router = new Router();

  router.add('GET', '/health', async () => ok({ status: 'ok' }));

  router.add('POST', '/accounts/:accountId/feedback', async (req) => {
    const accountId = req.params.accountId ?? '';
    const { record, errors } = coerceRecord(accountId, req.body);
    if (errors || !record) return badRequest('invalid feedback record', { details: errors ?? [] });
    const stored = await deps.feedback.save(record);
    if (!stored) return conflict('record id was previously deleted and cannot be re-created (INV-7)');
    return created({ stored: true, recordId: record.recordId });
  });

  router.add('GET', '/accounts/:accountId/feedback', async (req) => {
    const accountId = req.params.accountId ?? '';
    const records = await deps.feedback.list(accountId);
    return ok({ records, count: records.length });
  });

  router.add('POST', '/accounts/:accountId/query', async (req) => {
    const accountId = req.params.accountId ?? '';
    const b = (typeof req.body === 'object' && req.body ? req.body : {}) as Record<string, unknown>;
    const query = typeof b.query === 'string' ? b.query.trim() : '';
    if (!query) return badRequest('query is required');
    const records = await deps.feedback.list(accountId); // INV-6: only this account's data
    const answer = answerQuery(records, accountId, query, deps.answerer ?? baselineAnswerer);
    return ok(answer);
  });

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
