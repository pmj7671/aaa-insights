/**
 * In-memory RecoveryCaseRepository — a real implementation of the storage port for
 * tests and offline use. Enforces tenant isolation (INV-6) with the same semantics the
 * Postgres adapter must match (see the shared contract test).
 */
import type { RecoveryCase } from '../domain/recovery.js';
import type { RecoveryCaseRepository } from './ports.js';

const key = (accountId: string, caseId: string) => JSON.stringify([accountId, caseId]);

export class MemoryRecoveryCaseRepository implements RecoveryCaseRepository {
  private readonly cases = new Map<string, RecoveryCase>();

  async save(accountId: string, recoveryCase: RecoveryCase): Promise<void> {
    this.cases.set(key(accountId, recoveryCase.id), { ...recoveryCase, recordIds: [...recoveryCase.recordIds] });
  }

  async get(accountId: string, caseId: string): Promise<RecoveryCase | null> {
    const c = this.cases.get(key(accountId, caseId)); // INV-6: scoped by account
    return c ? { ...c, recordIds: [...c.recordIds] } : null;
  }

  async list(accountId: string): Promise<RecoveryCase[]> {
    const out: RecoveryCase[] = [];
    for (const [k, c] of this.cases) {
      if ((JSON.parse(k) as [string, string])[0] === accountId) out.push({ ...c, recordIds: [...c.recordIds] });
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  async listOpen(accountId: string): Promise<RecoveryCase[]> {
    return (await this.list(accountId)).filter((c) => c.status !== 'closed'); // DPS-5
  }

  async delete(accountId: string, caseId: string): Promise<void> {
    this.cases.delete(key(accountId, caseId));
  }
}
