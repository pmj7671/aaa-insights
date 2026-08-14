/**
 * In-memory ContactRepository — runs the shared storage contract.
 * Built in Phase 4, increment 22.
 */
import { MemoryContactRepository } from '../../src/persistence/memoryContactRepository';
import { runContactRepositoryContract } from './contactRepositoryContract';

runContactRepositoryContract('in-memory', async () => new MemoryContactRepository());
