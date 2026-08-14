/**
 * In-memory CompetitorRepository — a real implementation of the storage port for tests
 * and offline use. Enforces tenant isolation (INV-6) with the same semantics the
 * Postgres adapter must match (see the shared contract test).
 */
import type { Competitor } from '../domain/competitors.js';
import type { CompetitorRepository } from './ports.js';

const key = (accountId: string, brandId: string) => JSON.stringify([accountId, brandId]);

export class MemoryCompetitorRepository implements CompetitorRepository {
  private readonly competitors = new Map<string, Competitor>();

  async save(accountId: string, competitor: Competitor): Promise<void> {
    this.competitors.set(key(accountId, competitor.brandId), {
      ...competitor,
      aliases: [...competitor.aliases],
      ...(competitor.products ? { products: [...competitor.products] } : {}),
    });
  }

  async get(accountId: string, brandId: string): Promise<Competitor | null> {
    const c = this.competitors.get(key(accountId, brandId)); // INV-6: scoped by account
    return c ? { ...c, aliases: [...c.aliases] } : null;
  }

  async list(accountId: string): Promise<Competitor[]> {
    const out: Competitor[] = [];
    for (const [k, c] of this.competitors) {
      if ((JSON.parse(k) as [string, string])[0] === accountId) out.push({ ...c, aliases: [...c.aliases] });
    }
    return out.sort((a, b) => a.brandId.localeCompare(b.brandId));
  }

  async listTracked(accountId: string): Promise<Competitor[]> {
    return (await this.list(accountId)).filter((c) => c.tracked); // R-24
  }

  async delete(accountId: string, brandId: string): Promise<void> {
    this.competitors.delete(key(accountId, brandId));
  }
}
