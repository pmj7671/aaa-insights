/**
 * Postgres FeedbackRepository — runs the SAME shared storage contract against a real
 * Postgres+pgvector database. Built in Phase 4, increment 20.
 *
 * This is an integration test: it runs only when AAA_TEST_DATABASE_URL points at a
 * reachable Postgres, and skips cleanly otherwise (e.g. on CI without a database), so
 * the default suite stays green everywhere. To run it locally, start Postgres and set
 * AAA_TEST_DATABASE_URL, then `npm test`.
 */
import { describe, it, afterAll } from 'vitest';
import pg from 'pg';
import { PgFeedbackRepository } from '../../src/persistence/pgFeedbackRepository';
import { applySchema } from '../../src/persistence/pgFeedbackRepository';
import { runFeedbackRepositoryContract } from './feedbackRepositoryContract';

const url = process.env.AAA_TEST_DATABASE_URL;

if (!url) {
  describe.skip('FeedbackRepository contract — postgres (set AAA_TEST_DATABASE_URL to run)', () => {
    it('skipped — no database configured', () => {});
  });
} else {
  const pool = new pg.Pool({ connectionString: url });
  runFeedbackRepositoryContract('postgres', async () => {
    await applySchema(pool);
    await pool.query('TRUNCATE feedback_records, tombstones');
    return new PgFeedbackRepository(pool);
  });
  afterAll(async () => {
    await pool.end();
  });
}
