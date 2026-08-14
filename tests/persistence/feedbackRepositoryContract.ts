/**
 * Shared conformance contract for FeedbackRepository. BOTH the in-memory and the
 * Postgres adapters run this exact suite, so the two are guaranteed to behave
 * identically at the storage boundary. Built in Phase 4, increment 20.
 * Reinforces: INV-6 (tenant isolation) and INV-7 (deleted data never reappears).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { FeedbackRepository } from '../../src/persistence/ports';
import type { FeedbackRecord } from '../../src/domain/feedbackRecord';

const rec = (over: Partial<FeedbackRecord> = {}): FeedbackRecord => ({
  recordId: 'r1',
  accountId: 'a1',
  brandId: 'b1',
  sourceId: 's1',
  sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00.000Z',
  isComplete: true,
  flags: [],
  ...over,
});

/**
 * @param makeRepo returns a FRESH, empty repository for each test (integration
 *   adapters should truncate their tables here).
 */
export function runFeedbackRepositoryContract(name: string, makeRepo: () => Promise<FeedbackRepository>): void {
  describe(`FeedbackRepository contract — ${name}`, () => {
    let repo: FeedbackRepository;
    beforeEach(async () => {
      repo = await makeRepo();
    });

    it('round-trips a saved record', async () => {
      await repo.save(rec({ recordId: 'r1', commentText: 'hello', ratingNorm: 4 }));
      const got = await repo.get('a1', 'r1');
      expect(got?.commentText).toBe('hello');
      expect(got?.ratingNorm).toBe(4);
    });

    it('upserts on the same id', async () => {
      await repo.save(rec({ recordId: 'r1', commentText: 'v1' }));
      await repo.save(rec({ recordId: 'r1', commentText: 'v2' }));
      expect((await repo.get('a1', 'r1'))?.commentText).toBe('v2');
      expect(await repo.count('a1')).toBe(1);
    });

    it('INV-6: reads are isolated by account', async () => {
      await repo.save(rec({ recordId: 'r1', accountId: 'a1' }));
      await repo.save(rec({ recordId: 'r2', accountId: 'a2' }));
      expect(await repo.get('a1', 'r2')).toBeNull(); // cannot reach another account's row
      expect((await repo.list('a1')).map((r) => r.recordId)).toEqual(['r1']);
      expect(await repo.count('a1')).toBe(1);
    });

    it('INV-7: delete removes the row and tombstones the id', async () => {
      await repo.save(rec({ recordId: 'r1' }));
      await repo.delete('a1', 'r1');
      expect(await repo.get('a1', 'r1')).toBeNull();
      expect(await repo.isTombstoned('a1', 'r1')).toBe(true);
    });

    it('INV-7: a tombstoned id cannot be re-saved', async () => {
      await repo.save(rec({ recordId: 'r1' }));
      await repo.delete('a1', 'r1');
      const stored = await repo.save(rec({ recordId: 'r1', commentText: 'resurrected' }));
      expect(stored).toBe(false);
      expect(await repo.get('a1', 'r1')).toBeNull();
    });

    it('INV-6/INV-7: a tombstone in one account does not block the same id in another', async () => {
      await repo.save(rec({ recordId: 'r1', accountId: 'a1' }));
      await repo.delete('a1', 'r1');
      const stored = await repo.save(rec({ recordId: 'r1', accountId: 'a2' }));
      expect(stored).toBe(true);
      expect(await repo.get('a2', 'r1')).not.toBeNull();
    });

    it('delete is idempotent on an absent id', async () => {
      await repo.delete('a1', 'ghost');
      expect(await repo.isTombstoned('a1', 'ghost')).toBe(true);
    });
  });
}
