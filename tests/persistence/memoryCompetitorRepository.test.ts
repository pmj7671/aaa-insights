/**
 * In-memory CompetitorRepository — runs the shared storage contract.
 * Built in Phase 4, increment 22.
 */
import { MemoryCompetitorRepository } from '../../src/persistence/memoryCompetitorRepository';
import { runCompetitorRepositoryContract } from './competitorRepositoryContract';

runCompetitorRepositoryContract('in-memory', async () => new MemoryCompetitorRepository());
