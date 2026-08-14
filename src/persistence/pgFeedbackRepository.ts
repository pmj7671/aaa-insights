/**
 * Postgres (+pgvector) FeedbackRepository — the production storage adapter.
 *
 * Same port as the in-memory repo (see the shared contract test), so the domain is
 * unaffected by the swap. Tenant isolation (INV-6) is enforced by an account_id filter
 * on every statement; deletions tombstone the id (INV-7) and `save` refuses a tombstoned
 * id in a single race-free statement.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Pool } from 'pg';
import type { FeedbackRecord, SourceType, RecordFlag } from '../domain/feedbackRecord.js';
import type { FeedbackRepository } from './ports.js';

const SCHEMA_PATH = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');

/** Create the tables/extension if absent. Safe to call repeatedly (idempotent DDL). */
export async function applySchema(pool: Pool): Promise<void> {
  await pool.query(readFileSync(SCHEMA_PATH, 'utf8'));
}

function rowToRecord(r: Record<string, unknown>): FeedbackRecord {
  const rec: FeedbackRecord = {
    recordId: r.record_id as string,
    accountId: r.account_id as string,
    brandId: r.brand_id as string,
    sourceId: r.source_id as string,
    sourceType: r.source_type as SourceType,
    capturedAt: (r.captured_at as Date).toISOString(),
    isComplete: r.is_complete as boolean,
    flags: (r.flags as RecordFlag[]) ?? [],
  };
  if (r.rating_raw != null) rec.ratingRaw = r.rating_raw as number;
  if (r.rating_scale != null) rec.ratingScale = r.rating_scale as FeedbackRecord['ratingScale'];
  if (r.rating_norm !== undefined) rec.ratingNorm = r.rating_norm as number | null;
  if (r.brand_love != null) rec.brandLove = r.brand_love as FeedbackRecord['brandLove'];
  if (r.trust != null) rec.trust = r.trust as number;
  if (r.comment_text != null) rec.commentText = r.comment_text as string;
  if (r.language != null) rec.language = r.language as string;
  if (r.segment != null) rec.segment = r.segment as string;
  if (r.provenance != null) rec.provenance = r.provenance as string;
  return rec;
}

export class PgFeedbackRepository implements FeedbackRepository {
  constructor(private readonly pool: Pool) {}

  async save(record: FeedbackRecord): Promise<boolean> {
    // INV-7: a tombstoned id is refused; INSERT..SELECT..WHERE NOT EXISTS makes the
    // refusal race-free (guards both the insert and the on-conflict update paths).
    const res = await this.pool.query(
      `INSERT INTO feedback_records
         (account_id, record_id, brand_id, source_id, source_type, captured_at,
          rating_raw, rating_scale, rating_norm, brand_love, trust, comment_text,
          language, segment, provenance, is_complete, flags)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
       WHERE NOT EXISTS (SELECT 1 FROM tombstones t WHERE t.account_id=$1 AND t.record_id=$2)
       ON CONFLICT (account_id, record_id) DO UPDATE SET
          brand_id=EXCLUDED.brand_id, source_id=EXCLUDED.source_id,
          source_type=EXCLUDED.source_type, captured_at=EXCLUDED.captured_at,
          rating_raw=EXCLUDED.rating_raw, rating_scale=EXCLUDED.rating_scale,
          rating_norm=EXCLUDED.rating_norm, brand_love=EXCLUDED.brand_love,
          trust=EXCLUDED.trust, comment_text=EXCLUDED.comment_text,
          language=EXCLUDED.language, segment=EXCLUDED.segment,
          provenance=EXCLUDED.provenance, is_complete=EXCLUDED.is_complete,
          flags=EXCLUDED.flags`,
      [
        record.accountId, record.recordId, record.brandId, record.sourceId, record.sourceType,
        record.capturedAt, record.ratingRaw ?? null, record.ratingScale ?? null,
        record.ratingNorm ?? null, record.brandLove ?? null, record.trust ?? null,
        record.commentText ?? null, record.language ?? null, record.segment ?? null,
        record.provenance ?? null, record.isComplete, record.flags,
      ],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async get(accountId: string, recordId: string): Promise<FeedbackRecord | null> {
    const res = await this.pool.query(
      'SELECT * FROM feedback_records WHERE account_id=$1 AND record_id=$2',
      [accountId, recordId],
    );
    return res.rows[0] ? rowToRecord(res.rows[0]) : null;
  }

  async list(accountId: string): Promise<FeedbackRecord[]> {
    const res = await this.pool.query(
      'SELECT * FROM feedback_records WHERE account_id=$1 ORDER BY record_id',
      [accountId],
    );
    return res.rows.map(rowToRecord);
  }

  async count(accountId: string): Promise<number> {
    const res = await this.pool.query(
      'SELECT count(*)::int AS n FROM feedback_records WHERE account_id=$1',
      [accountId],
    );
    return (res.rows[0]?.n as number) ?? 0;
  }

  async delete(accountId: string, recordId: string): Promise<void> {
    // INV-7: remove the row and record the tombstone atomically.
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM feedback_records WHERE account_id=$1 AND record_id=$2', [accountId, recordId]);
      await client.query(
        'INSERT INTO tombstones (account_id, record_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [accountId, recordId],
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async isTombstoned(accountId: string, recordId: string): Promise<boolean> {
    const res = await this.pool.query(
      'SELECT 1 FROM tombstones WHERE account_id=$1 AND record_id=$2',
      [accountId, recordId],
    );
    return res.rows.length > 0;
  }
}
