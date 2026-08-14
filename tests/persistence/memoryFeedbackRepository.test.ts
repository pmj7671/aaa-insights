/**
 * In-memory FeedbackRepository — runs the shared storage contract.
 * Built in Phase 4, increment 20.
 */
import { MemoryFeedbackRepository } from '../../src/persistence/memoryFeedbackRepository';
import { runFeedbackRepositoryContract } from './feedbackRepositoryContract';

runFeedbackRepositoryContract('in-memory', async () => new MemoryFeedbackRepository());
