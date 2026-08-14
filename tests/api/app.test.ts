/**
 * Application API — vertical slice. Built in Phase 4, increment 23.
 * Exercises HTTP → validation → repository → domain in-process (no network),
 * including tenant isolation at the transport edge (INV-6) and the INV-7 conflict.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, type App } from '../../src/api/app';
import { MemoryFeedbackRepository } from '../../src/persistence/memoryFeedbackRepository';

const feedbackBody = (over: Record<string, unknown> = {}) => ({
  recordId: 'r1',
  brandId: 'b1',
  sourceId: 's1',
  sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00.000Z',
  isComplete: true,
  commentText: 'Checkout on mobile is slow',
  ...over,
});

describe('Application API (vertical slice)', () => {
  let app: App;
  let feedback: MemoryFeedbackRepository;
  beforeEach(() => {
    feedback = new MemoryFeedbackRepository();
    app = createApp({ feedback });
  });

  it('GET /health returns ok', async () => {
    const res = await app.handle({ method: 'GET', path: '/health' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST feedback ingests a valid record', async () => {
    const res = await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody() });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ stored: true, recordId: 'r1' });
    expect(await feedback.count('a1')).toBe(1);
  });

  it('POST feedback rejects an invalid record with 400 and details', async () => {
    const res = await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody({ brandId: '' }) });
    expect(res.status).toBe(400);
    expect((res.body as { details: string[] }).details.join(' ')).toMatch(/brand/i);
  });

  it('INV-6: a write is stamped with the account from the URL, not the body', async () => {
    // body claims account 'evil'; the URL says 'a1' — the record must land in a1 only
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody({ accountId: 'evil' }) });
    expect(await feedback.count('a1')).toBe(1);
    expect(await feedback.count('evil')).toBe(0);
    expect((await feedback.get('a1', 'r1'))?.accountId).toBe('a1');
  });

  it('GET feedback lists only the account in the URL (INV-6)', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody({ recordId: 'r1' }) });
    await app.handle({ method: 'POST', path: '/accounts/a2/feedback', body: feedbackBody({ recordId: 'r2' }) });
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/feedback' });
    expect(res.status).toBe(200);
    const body = res.body as { records: { recordId: string }[]; count: number };
    expect(body.count).toBe(1);
    expect(body.records[0]?.recordId).toBe('r1');
  });

  it('INV-7: re-creating a deleted id returns 409', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody() });
    await feedback.delete('a1', 'r1');
    const res = await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody() });
    expect(res.status).toBe(409);
  });

  it('POST query answers from the account data with citations (R-17)', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody({ recordId: 'r1', commentText: 'mobile checkout is slow' }) });
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: feedbackBody({ recordId: 'r2', commentText: 'the mobile checkout crashes' }) });
    const res = await app.handle({ method: 'POST', path: '/accounts/a1/query', body: { query: 'mobile checkout' } });
    expect(res.status).toBe(200);
    const body = res.body as { supported: boolean; citations: { recordId: string }[] };
    expect(body.supported).toBe(true);
    expect(body.citations.map((c) => c.recordId).sort()).toEqual(['r1', 'r2']);
  });

  it('POST query requires a query string', async () => {
    const res = await app.handle({ method: 'POST', path: '/accounts/a1/query', body: {} });
    expect(res.status).toBe(400);
  });

  it('unknown path is 404; wrong method on a known path is 405', async () => {
    expect((await app.handle({ method: 'GET', path: '/nope' })).status).toBe(404);
    expect((await app.handle({ method: 'DELETE', path: '/accounts/a1/feedback' })).status).toBe(405);
  });
});
