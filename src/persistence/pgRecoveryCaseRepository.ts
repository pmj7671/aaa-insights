/**
 * Postgres RecoveryCaseRepository — production storage adapter. Same port as the
 * in-memory repo (see the shared contract test). Tenant isolation (INV-6) is enforced
 * by an account_id filter on every statement.
 */
import type { Pool } from 'pg';
import type { RecoveryCase, CaseKind, CaseStatus } from '../domain/recovery.js';
import type { Quadrant } from '../domain/segmentation.js';
import type { RecoveryCaseRepository } from './ports.js';

function rowToCase(r: Record<string, unknown>): RecoveryCase {
  const c: RecoveryCase = {
    id: r.id as string,
    recordIds: (r.record_ids as string[]) ?? [],
    kind: r.kind as CaseKind,
    status: r.status as CaseStatus,
    groupingKey: r.grouping_key as string,
    openedAt: (r.opened_at as Date).toISOString(),
  };
  if (r.customer_ref != null) c.customerRef = r.customer_ref as string;
  if (r.owner_id != null) c.ownerId = r.owner_id as string;
  if (r.quadrant != null) c.quadrant = r.quadrant as Quadrant;
  if (r.trust != null) c.trust = r.trust as number;
  return c;
}

export class PgRecoveryCaseRepository implements RecoveryCaseRepository {
  constructor(private readonly pool: Pool) {}

  async save(accountId: string, c: RecoveryCase): Promise<void> {
    await this.pool.query(
      `INSERT INTO recovery_cases
         (account_id, id, record_ids, kind, status, grouping_key, opened_at,
          customer_ref, owner_id, quadrant, trust)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (account_id, id) DO UPDATE SET
          record_ids=EXCLUDED.record_ids, kind=EXCLUDED.kind, status=EXCLUDED.status,
          grouping_key=EXCLUDED.grouping_key, opened_at=EXCLUDED.opened_at,
          customer_ref=EXCLUDED.customer_ref, owner_id=EXCLUDED.owner_id,
          quadrant=EXCLUDED.quadrant, trust=EXCLUDED.trust`,
      [
        accountId, c.id, c.recordIds, c.kind, c.status, c.groupingKey, c.openedAt,
        c.customerRef ?? null, c.ownerId ?? null, c.quadrant ?? null, c.trust ?? null,
      ],
    );
  }

  async get(accountId: string, caseId: string): Promise<RecoveryCase | null> {
    const res = await this.pool.query(
      'SELECT * FROM recovery_cases WHERE account_id=$1 AND id=$2',
      [accountId, caseId],
    );
    return res.rows[0] ? rowToCase(res.rows[0]) : null;
  }

  async list(accountId: string): Promise<RecoveryCase[]> {
    const res = await this.pool.query(
      'SELECT * FROM recovery_cases WHERE account_id=$1 ORDER BY id',
      [accountId],
    );
    return res.rows.map(rowToCase);
  }

  async listOpen(accountId: string): Promise<RecoveryCase[]> {
    const res = await this.pool.query(
      "SELECT * FROM recovery_cases WHERE account_id=$1 AND status <> 'closed' ORDER BY id",
      [accountId],
    );
    return res.rows.map(rowToCase);
  }

  async delete(accountId: string, caseId: string): Promise<void> {
    await this.pool.query('DELETE FROM recovery_cases WHERE account_id=$1 AND id=$2', [accountId, caseId]);
  }
}
