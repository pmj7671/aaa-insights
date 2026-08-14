/**
 * Application API — report + CSV export read projections. Phase 4, increment 25.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, type App } from '../../src/api/app';
import { MemoryFeedbackRepository } from '../../src/persistence/memoryFeedbackRepository';

const body = (over: Record<string, unknown> = {}) => ({
  recordId: 'r1', brandId: 'b1', sourceId: 's1', sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00.000Z', isComplete: true, ...over,
});

describe('Application API — report & export', () => {
  let app: App;
  beforeEach(() => {
    app = createApp({ feedback: new MemoryFeedbackRepository() });
  });

  it('GET report assembles from the account data; brand label from the query string', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: body({ recordId: 'r1', brandLove: 'love', trust: 5 }) });
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: body({ recordId: 'r2', brandLove: 'hate', trust: 1 }) });
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=Acme%20Co' });
    expect(res.status).toBe(200);
    const rep = res.body as { brandName: string; metrics: { brandLoveIndex: number | null } };
    expect(rep.brandName).toBe('Acme Co');
    expect(rep.metrics.brandLoveIndex).toBe(0); // 1 love − 1 hate over 2 stated
  });

  it('GET report is isolated to the account (INV-6)', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: body({ recordId: 'r1', brandLove: 'love' }) });
    await app.handle({ method: 'POST', path: '/accounts/a2/feedback', body: body({ recordId: 'r2', brandLove: 'hate' }) });
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/report?brand=Mine' });
    expect((res.body as { metrics: { brandLoveIndex: number | null } }).metrics.brandLoveIndex).toBe(100);
  });

  it('GET export returns text/csv with a header row and the account rows (R-22)', async () => {
    await app.handle({ method: 'POST', path: '/accounts/a1/feedback', body: body({ recordId: 'r1', commentText: 'has, comma' }) });
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/export' });
    expect(res.status).toBe(200);
    expect(res.headers?.['content-type']).toBe('text/csv');
    const csv = res.body as string;
    const lines = csv.trim().split('\n');
    expect(lines[0]).toContain('recordId');
    expect(lines).toHaveLength(2); // header + one row
    expect(csv).toContain('"has, comma"'); // comma-bearing cell is quoted
  });

  it('GET export for an empty account returns just the header row', async () => {
    const res = await app.handle({ method: 'GET', path: '/accounts/empty/export' });
    expect((res.body as string).trim().split('\n')).toHaveLength(1);
  });
});
