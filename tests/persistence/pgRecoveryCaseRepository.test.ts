/**
 * Postgres RecoveryCaseRepository — runs the SAME shared storage contract against a
 * real Postgres database. Built in Phase 4, increment 21.
 *
 * Integration test: runs only when AAA_TEST_DATABASE_URL points at a reachable
 * Postgres, and skips cleanly otherwise so the default suite stays green everywhere.
 */
import { describe, it, afterAll } from 'vitest';
import pg from 'pg';
import { PgRecoveryCaseRepository } from '../../src/persistence/pgRecoveryCaseRepository';
import { applySchema } from '../../src/persistence/pgFeedbackRepository';
import { runRecoveryCaseRepositoryContract } from './recoveryCaseRepositoryContract';

const url = process.env.AAA_TEST_DATABASE_URL;

if (!url) {
  describe.skip('RecoveryCaseRepository contract — postgres (set AAA_TEST_DATABASE_URL to run)', () => {
    it('skipped — no database configured', () => {});
  });
} else {
  const pool = new pg.Pool({ connectionString: url });
  runRecoveryCaseRepositoryContract('postgres', async () => {
    await applySchema(pool);
    await pool.query('TRUNCATE recovery_cases');
    return new PgRecoveryCaseRepository(pool);
  });
  afterAll(async () => {
    await pool.end();
  });
}
