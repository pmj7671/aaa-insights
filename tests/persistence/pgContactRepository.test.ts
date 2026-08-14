/**
 * Postgres ContactRepository — runs the SAME shared storage contract against a real
 * Postgres database. Built in Phase 4, increment 22.
 *
 * Integration test: runs only when AAA_TEST_DATABASE_URL points at a reachable
 * Postgres, and skips cleanly otherwise so the default suite stays green everywhere.
 */
import { describe, it, afterAll } from 'vitest';
import pg from 'pg';
import { PgContactRepository } from '../../src/persistence/pgContactRepository';
import { applySchema } from '../../src/persistence/pgFeedbackRepository';
import { runContactRepositoryContract } from './contactRepositoryContract';

const url = process.env.AAA_TEST_DATABASE_URL;

if (!url) {
  describe.skip('ContactRepository contract — postgres (set AAA_TEST_DATABASE_URL to run)', () => {
    it('skipped — no database configured', () => {});
  });
} else {
  const pool = new pg.Pool({ connectionString: url });
  runContactRepositoryContract('postgres', async () => {
    await applySchema(pool);
    await pool.query('TRUNCATE contacts');
    return new PgContactRepository(pool);
  });
  afterAll(async () => {
    await pool.end();
  });
}
