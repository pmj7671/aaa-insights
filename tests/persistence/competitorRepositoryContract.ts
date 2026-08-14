/**
 * Shared conformance contract for CompetitorRepository. BOTH adapters run this suite.
 * Built in Phase 4, increment 22. Reinforces INV-6 and the R-24 tracked-only view.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { CompetitorRepository } from '../../src/persistence/ports';
import type { Competitor } from '../../src/domain/competitors';

const rival = (over: Partial<Competitor> = {}): Competitor => ({
  brandId: 'c1',
  name: 'Rival Co',
  aliases: ['RivalCo', 'Rival'],
  tracked: true,
  ...over,
});

export function runCompetitorRepositoryContract(name: string, makeRepo: () => Promise<CompetitorRepository>): void {
  describe(`CompetitorRepository contract — ${name}`, () => {
    let repo: CompetitorRepository;
    beforeEach(async () => {
      repo = await makeRepo();
    });

    it('round-trips a competitor, preserving aliases and optional products', async () => {
      await repo.save('a1', rival({ brandId: 'c1', aliases: ['x', 'y'], products: ['p1'] }));
      const got = await repo.get('a1', 'c1');
      expect(got?.aliases).toEqual(['x', 'y']);
      expect(got?.products).toEqual(['p1']);
    });

    it('upserts on the same brandId (e.g. a rename)', async () => {
      await repo.save('a1', rival({ brandId: 'c1', name: 'Old' }));
      await repo.save('a1', rival({ brandId: 'c1', name: 'New' }));
      expect((await repo.get('a1', 'c1'))?.name).toBe('New');
      expect(await repo.list('a1')).toHaveLength(1);
    });

    it('INV-6: reads are isolated by account', async () => {
      await repo.save('a1', rival({ brandId: 'c1' }));
      await repo.save('a2', rival({ brandId: 'c2' }));
      expect(await repo.get('a1', 'c2')).toBeNull();
      expect((await repo.list('a1')).map((c) => c.brandId)).toEqual(['c1']);
    });

    it('R-24: listTracked returns only tracked competitors for the account', async () => {
      await repo.save('a1', rival({ brandId: 'c1', tracked: true }));
      await repo.save('a1', rival({ brandId: 'c2', tracked: false }));
      await repo.save('a2', rival({ brandId: 'c3', tracked: true })); // other account
      expect((await repo.listTracked('a1')).map((c) => c.brandId)).toEqual(['c1']);
    });

    it('delete is isolated and idempotent', async () => {
      await repo.save('a1', rival({ brandId: 'c1' }));
      await repo.delete('a1', 'c1');
      expect(await repo.get('a1', 'c1')).toBeNull();
      await expect(repo.delete('a1', 'ghost')).resolves.toBeUndefined();
    });
  });
}
