/**
 * In-memory FeedbackRepository — a real implementation of the storage port for tests
 * and offline/local use. Enforces tenant isolation (INV-6) and tombstones (INV-7) with
 * the same semantics the Postgres adapter must match (see the shared contract test).
 */
import type { FeedbackRecord } from '../domain/feedbackRecord.js';
import type { FeedbackRepository } from './ports.js';

const key = (accountId: string, recordId: string) => JSON.stringify([accountId, recordId]);

export class MemoryFeedbackRepository implements FeedbackRepository {
  private readonly records = new Map<string, FeedbackRecord>();
  private readonly tombstones = new Set<string>();

  async save(record: FeedbackRecord): Promise<boolean> {
    const k = key(record.accountId, record.recordId);
    if (this.tombstones.has(k)) return false; // INV-7
    this.records.set(k, { ...record });
    return true;
  }

  async get(accountId: string, recordId: string): Promise<FeedbackRecord | null> {
    const r = this.records.get(key(accountId, recordId)); // INV-6: scoped by account
    return r ? { ...r } : null;
  }

  async list(accountId: string): Promise<FeedbackRecord[]> {
    const out: FeedbackRecord[] = [];
    for (const r of this.records.values()) if (r.accountId === accountId) out.push({ ...r });
    return out.sort((a, b) => a.recordId.localeCompare(b.recordId));
  }

  async count(accountId: string): Promise<number> {
    let n = 0;
    for (const r of this.records.values()) if (r.accountId === accountId) n++;
    return n;
  }

  async delete(accountId: string, recordId: string): Promise<void> {
    const k = key(accountId, recordId);
    this.records.delete(k);
    this.tombstones.add(k); // INV-7
  }

  async isTombstoned(accountId: string, recordId: string): Promise<boolean> {
    return this.tombstones.has(key(accountId, recordId));
  }
}
