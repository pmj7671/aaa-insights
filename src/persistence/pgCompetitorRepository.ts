/**
 * Postgres CompetitorRepository — production storage adapter. Same port as the
 * in-memory repo (see the shared contract test). Tenant isolation (INV-6) via an
 * account_id filter on every statement.
 */
import type { Pool } from 'pg';
import type { Competitor } from '../domain/competitors.js';
import type { CompetitorRepository } from './ports.js';

function rowToCompetitor(r: Record<string, unknown>): Competitor {
  const c: Competitor = {
    brandId: r.brand_id as string,
    name: r.name as string,
    aliases: (r.aliases as string[]) ?? [],
    tracked: r.tracked as boolean,
  };
  const products = (r.products as string[]) ?? [];
  if (products.length > 0) c.products = products;
  return c;
}

export class PgCompetitorRepository implements CompetitorRepository {
  constructor(private readonly pool: Pool) {}

  async save(accountId: string, c: Competitor): Promise<void> {
    await this.pool.query(
      `INSERT INTO competitors (account_id, brand_id, name, aliases, products, tracked)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (account_id, brand_id) DO UPDATE SET
          name=EXCLUDED.name, aliases=EXCLUDED.aliases,
          products=EXCLUDED.products, tracked=EXCLUDED.tracked`,
      [accountId, c.brandId, c.name, c.aliases, c.products ?? [], c.tracked],
    );
  }

  async get(accountId: string, brandId: string): Promise<Competitor | null> {
    const res = await this.pool.query('SELECT * FROM competitors WHERE account_id=$1 AND brand_id=$2', [accountId, brandId]);
    return res.rows[0] ? rowToCompetitor(res.rows[0]) : null;
  }

  async list(accountId: string): Promise<Competitor[]> {
    const res = await this.pool.query('SELECT * FROM competitors WHERE account_id=$1 ORDER BY brand_id', [accountId]);
    return res.rows.map(rowToCompetitor);
  }

  async listTracked(accountId: string): Promise<Competitor[]> {
    const res = await this.pool.query('SELECT * FROM competitors WHERE account_id=$1 AND tracked ORDER BY brand_id', [accountId]);
    return res.rows.map(rowToCompetitor);
  }

  async delete(accountId: string, brandId: string): Promise<void> {
    await this.pool.query('DELETE FROM competitors WHERE account_id=$1 AND brand_id=$2', [accountId, brandId]);
  }
}
