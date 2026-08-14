/**
 * In-memory RecoveryCaseRepository — runs the shared storage contract.
 * Built in Phase 4, increment 21.
 */
import { MemoryRecoveryCaseRepository } from '../../src/persistence/memoryRecoveryCaseRepository';
import { runRecoveryCaseRepositoryContract } from './recoveryCaseRepositoryContract';

runRecoveryCaseRepositoryContract('in-memory', async () => new MemoryRecoveryCaseRepository());
