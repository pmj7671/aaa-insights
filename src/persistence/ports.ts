/**
 * Persistence ports — the storage boundary the domain depends on.
 *
 * These interfaces are technology-agnostic: the domain and application code speak
 * only to these ports, and an adapter (in-memory for tests/offline; Postgres+pgvector
 * in production) implements them. Two invariants are baked into the SHAPE of the port,
 * so no adapter can violate them:
 *
 *  - INV-6 (tenant isolation): every read/delete is parameterised by `accountId`, so a
 *    caller can only ever reach one account's data — cross-tenant access is not
 *    expressible through this interface.
 *  - INV-7 (deleted data never reappears): `delete` tombstones the id, and `save`
 *    refuses a tombstoned id, so a re-import cannot resurrect deleted data.
 *
 * All operations are async so the same port serves an in-memory Map and a real database.
 */
import type { FeedbackRecord } from '../domain/feedbackRecord.js';
import type { RecoveryCase } from '../domain/recovery.js';

export interface FeedbackRepository {
  /**
   * Upsert a response. A record whose id has been tombstoned is silently ignored —
   * deleted data never reappears (INV-7). Returns whether the record was stored.
   */
  save(record: FeedbackRecord): Promise<boolean>;

  /** Fetch one response within an account, or null. Scoped by accountId (INV-6). */
  get(accountId: string, recordId: string): Promise<FeedbackRecord | null>;

  /** All responses for one account (INV-6). */
  list(accountId: string): Promise<FeedbackRecord[]>;

  /** Count of responses for one account (INV-6). */
  count(accountId: string): Promise<number>;

  /**
   * Delete one response and tombstone its id (INV-7). Idempotent: deleting an absent
   * id still records the tombstone. Scoped by accountId (INV-6).
   */
  delete(accountId: string, recordId: string): Promise<void>;

  /** Whether an id has been tombstoned within an account (INV-7). */
  isTombstoned(accountId: string, recordId: string): Promise<boolean>;
}

/**
 * Storage for RecoveryCases. The domain `RecoveryCase` is account-agnostic, so the
 * owning tenant is supplied explicitly here and every read/delete is scoped by it
 * (INV-6). `listOpen` backs the DPS-5 retention hold and the closed-loop dashboards.
 */
export interface RecoveryCaseRepository {
  /** Upsert a case for an account. */
  save(accountId: string, recoveryCase: RecoveryCase): Promise<void>;

  /** Fetch one case within an account, or null (INV-6). */
  get(accountId: string, caseId: string): Promise<RecoveryCase | null>;

  /** All cases for one account (INV-6). */
  list(accountId: string): Promise<RecoveryCase[]>;

  /** Only the still-open cases (status !== 'closed') for one account (DPS-5). */
  listOpen(accountId: string): Promise<RecoveryCase[]>;

  /** Delete one case within an account (INV-6). Idempotent. */
  delete(accountId: string, caseId: string): Promise<void>;
}
