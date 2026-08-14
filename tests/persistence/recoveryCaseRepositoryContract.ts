/**
 * Shared conformance contract for RecoveryCaseRepository. BOTH the in-memory and the
 * Postgres adapters run this exact suite, so the two behave identically at the storage
 * boundary. Built in Phase 4, increment 21.
 * Reinforces: INV-6 (tenant isolation) and the DPS-5 open-case query.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { RecoveryCaseRepository } from '../../src/persistence/ports';
import type { RecoveryCase } from '../../src/domain/recovery';

const kase = (over: Partial<RecoveryCase> = {}): RecoveryCase => ({
  id: 'case1',
  recordIds: ['r1'],
  kind: 'contactable',
  status: 'open',
  groupingKey: 'g1',
  openedAt: '2026-08-01T00:00:00.000Z',
  ...over,
});

export function runRecoveryCaseRepositoryContract(name: string, makeRepo: () => Promise<RecoveryCaseRepository>): void {
  describe(`RecoveryCaseRepository contract — ${name}`, () => {
    let repo: RecoveryCaseRepository;
    beforeEach(async () => {
      repo = await makeRepo();
    });

    it('round-trips a saved case, preserving recordIds and optional fields', async () => {
      await repo.save('a1', kase({ id: 'c1', recordIds: ['r1', 'r2'], ownerId: 'u9', trust: -3 }));
      const got = await repo.get('a1', 'c1');
      expect(got?.recordIds).toEqual(['r1', 'r2']);
      expect(got?.ownerId).toBe('u9');
      expect(got?.trust).toBe(-3);
    });

    it('upserts on the same id (e.g. a status transition)', async () => {
      await repo.save('a1', kase({ id: 'c1', status: 'open' }));
      await repo.save('a1', kase({ id: 'c1', status: 'resolved' }));
      expect((await repo.get('a1', 'c1'))?.status).toBe('resolved');
      expect(await repo.list('a1')).toHaveLength(1);
    });

    it('INV-6: reads are isolated by account', async () => {
      await repo.save('a1', kase({ id: 'c1' }));
      await repo.save('a2', kase({ id: 'c2' }));
      expect(await repo.get('a1', 'c2')).toBeNull();
      expect((await repo.list('a1')).map((c) => c.id)).toEqual(['c1']);
    });

    it('DPS-5: listOpen returns only non-closed cases for the account', async () => {
      await repo.save('a1', kase({ id: 'c1', status: 'open' }));
      await repo.save('a1', kase({ id: 'c2', status: 'in_progress' }));
      await repo.save('a1', kase({ id: 'c3', status: 'closed' }));
      await repo.save('a2', kase({ id: 'c4', status: 'open' })); // other account
      expect((await repo.listOpen('a1')).map((c) => c.id)).toEqual(['c1', 'c2']);
    });

    it('delete removes only the targeted case within the account', async () => {
      await repo.save('a1', kase({ id: 'c1' }));
      await repo.save('a1', kase({ id: 'c2' }));
      await repo.delete('a1', 'c1');
      expect(await repo.get('a1', 'c1')).toBeNull();
      expect((await repo.list('a1')).map((c) => c.id)).toEqual(['c2']);
    });

    it('delete is idempotent on an absent id', async () => {
      await expect(repo.delete('a1', 'ghost')).resolves.toBeUndefined();
    });
  });
}
