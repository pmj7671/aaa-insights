/**
 * Shared conformance contract for ContactRepository. BOTH adapters run this suite.
 * Built in Phase 4, increment 22. Reinforces INV-6 and the E-17 consent-withdrawal path.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { ContactRepository } from '../../src/persistence/ports';
import type { Contact } from '../../src/domain/contact';

const contact = (over: Partial<Contact> = {}): Contact => ({
  contactId: 'k1',
  respondentRef: 'r1',
  channel: 'email',
  value: 'x@example.com',
  consentScope: 'service_recovery',
  consentAt: '2026-08-01T00:00:00.000Z',
  origin: 'first_party',
  ...(over as object),
});

export function runContactRepositoryContract(name: string, makeRepo: () => Promise<ContactRepository>): void {
  describe(`ContactRepository contract — ${name}`, () => {
    let repo: ContactRepository;
    beforeEach(async () => {
      repo = await makeRepo();
    });

    it('round-trips a saved contact', async () => {
      await repo.save('a1', contact({ contactId: 'k1', value: 'a@b.com' }));
      expect((await repo.get('a1', 'k1'))?.value).toBe('a@b.com');
    });

    it('INV-6: reads are isolated by account', async () => {
      await repo.save('a1', contact({ contactId: 'k1' }));
      await repo.save('a2', contact({ contactId: 'k2' }));
      expect(await repo.get('a1', 'k2')).toBeNull();
      expect((await repo.list('a1')).map((c) => c.contactId)).toEqual(['k1']);
    });

    it('E-17: withdrawing consent is a save with withdrawnAt set', async () => {
      await repo.save('a1', contact({ contactId: 'k1' }));
      await repo.save('a1', contact({ contactId: 'k1', withdrawnAt: '2026-08-05T00:00:00.000Z' }));
      expect((await repo.get('a1', 'k1'))?.withdrawnAt).toBe('2026-08-05T00:00:00.000Z');
    });

    it('E-17: a contact can be purged; delete is isolated and idempotent', async () => {
      await repo.save('a1', contact({ contactId: 'k1' }));
      await repo.delete('a1', 'k1');
      expect(await repo.get('a1', 'k1')).toBeNull();
      await expect(repo.delete('a1', 'ghost')).resolves.toBeUndefined();
    });
  });
}
