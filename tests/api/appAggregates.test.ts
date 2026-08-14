/**
 * Application API — cases / contacts / competitors endpoints. Phase 4, increment 24.
 * All wired over in-memory repositories; exercised in-process (no network).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, type App } from '../../src/api/app';
import { MemoryFeedbackRepository } from '../../src/persistence/memoryFeedbackRepository';
import { MemoryRecoveryCaseRepository } from '../../src/persistence/memoryRecoveryCaseRepository';
import { MemoryContactRepository } from '../../src/persistence/memoryContactRepository';
import { MemoryCompetitorRepository } from '../../src/persistence/memoryCompetitorRepository';
import type { RecoveryCase } from '../../src/domain/recovery';
import type { Contact } from '../../src/domain/contact';

const kase = (over: Partial<RecoveryCase> = {}): RecoveryCase => ({
  id: 'c1', recordIds: ['r1'], kind: 'contactable', status: 'open',
  groupingKey: 'g1', openedAt: '2026-08-01T00:00:00.000Z', ...over,
});
const contact = (over: Partial<Contact> = {}): Contact => ({
  contactId: 'k1', respondentRef: 'r1', channel: 'email', value: 'x@y.com',
  consentScope: 'service_recovery', consentAt: '2026-08-01T00:00:00.000Z', origin: 'first_party', ...(over as object),
});

describe('Application API — aggregate endpoints', () => {
  let app: App;
  let cases: MemoryRecoveryCaseRepository;
  let contacts: MemoryContactRepository;
  let competitors: MemoryCompetitorRepository;

  beforeEach(() => {
    cases = new MemoryRecoveryCaseRepository();
    contacts = new MemoryContactRepository();
    competitors = new MemoryCompetitorRepository();
    app = createApp({ feedback: new MemoryFeedbackRepository(), cases, contacts, competitors });
  });

  it('GET cases lists an account; /cases/open returns only non-closed (DPS-5)', async () => {
    await cases.save('a1', kase({ id: 'c1', status: 'open' }));
    await cases.save('a1', kase({ id: 'c2', status: 'closed' }));
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/cases' })).body).toMatchObject({ count: 2 });
    const open = await app.handle({ method: 'GET', path: '/accounts/a1/cases/open' });
    expect((open.body as { cases: RecoveryCase[] }).cases.map((c) => c.id)).toEqual(['c1']);
  });

  it('GET a specific case returns it, or 404', async () => {
    await cases.save('a1', kase({ id: 'c1' }));
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/cases/c1' })).status).toBe(200);
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/cases/nope' })).status).toBe(404);
  });

  it('contacts: list, get, and delete (E-17 consent purge)', async () => {
    await contacts.save('a1', contact({ contactId: 'k1' }));
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/contacts' })).body).toMatchObject({ count: 1 });
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/contacts/k1' })).status).toBe(200);
    expect((await app.handle({ method: 'DELETE', path: '/accounts/a1/contacts/k1' })).status).toBe(200);
    expect(await contacts.get('a1', 'k1')).toBeNull();
  });

  it('competitors: PUT upserts config, GET, tracked view (R-24), and DELETE', async () => {
    const put = await app.handle({
      method: 'PUT', path: '/accounts/a1/competitors/rivalco',
      body: { name: 'Rival Co', aliases: ['Rival'], tracked: true },
    });
    expect(put.status).toBe(200);
    expect((await app.handle({ method: 'GET', path: '/accounts/a1/competitors/rivalco' })).status).toBe(200);

    await app.handle({ method: 'PUT', path: '/accounts/a1/competitors/hidden', body: { name: 'Hidden', tracked: false } });
    const tracked = await app.handle({ method: 'GET', path: '/accounts/a1/competitors/tracked' });
    expect((tracked.body as { competitors: { brandId: string }[] }).competitors.map((c) => c.brandId)).toEqual(['rivalco']);

    expect((await app.handle({ method: 'DELETE', path: '/accounts/a1/competitors/rivalco' })).status).toBe(200);
    expect(await competitors.get('a1', 'rivalco')).toBeNull();
  });

  it('competitors: the brandId comes from the URL, not the body (INV-6/id integrity)', async () => {
    await app.handle({ method: 'PUT', path: '/accounts/a1/competitors/urlid', body: { name: 'X', brandId: 'bodyid' } });
    expect(await competitors.get('a1', 'urlid')).not.toBeNull();
    expect(await competitors.get('a1', 'bodyid')).toBeNull();
  });

  it('competitors: PUT without a name is 400', async () => {
    const res = await app.handle({ method: 'PUT', path: '/accounts/a1/competitors/x', body: {} });
    expect(res.status).toBe(400);
  });

  it('INV-6: competitors listed for one account exclude another', async () => {
    await competitors.save('a1', { brandId: 'c1', name: 'A', aliases: [], tracked: true });
    await competitors.save('a2', { brandId: 'c2', name: 'B', aliases: [], tracked: true });
    const res = await app.handle({ method: 'GET', path: '/accounts/a1/competitors' });
    expect((res.body as { competitors: { brandId: string }[] }).competitors.map((c) => c.brandId)).toEqual(['c1']);
  });

  it('aggregate routes are absent when their repo is not wired', async () => {
    const minimal = createApp({ feedback: new MemoryFeedbackRepository() });
    expect((await minimal.handle({ method: 'GET', path: '/accounts/a1/competitors' })).status).toBe(404);
  });
});
