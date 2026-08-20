/**
 * Claude-backed grounded answerer. Built in Phase 4 (make-the-AI-real).
 * Covers R-17 wording via the LLM seam, grounding, and graceful fallback.
 * Uses a MOCK LLMProvider — no live model calls.
 */
import { describe, it, expect } from 'vitest';
import { createLlmAnswerer } from '../../src/domain/llmAnswerer';
import { answerQuery } from '../../src/domain/nlQuery';
import type { LLMProvider, LLMRequest, LLMResponse } from '../../src/domain/llmGateway';
import type { FeedbackRecord } from '../../src/domain/feedbackRecord';

const rec = (over: Partial<FeedbackRecord> = {}): FeedbackRecord => ({
  recordId: 'r1', accountId: 'a1', brandId: 'b1', sourceId: 's1', sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00.000Z', isComplete: true, flags: [], ...over,
});

const provider = (impl: (req: LLMRequest) => Promise<LLMResponse>): LLMProvider => ({ complete: impl });

const canned = (text: string): LLMProvider =>
  provider(async () => ({ text, inputTokens: 10, outputTokens: 20, modelVersion: 'mock-claude' }));

const evidence = [rec({ recordId: 'r1', commentText: 'mobile checkout is slow' })];

describe('createLlmAnswerer (R-17 wording via the LLM seam)', () => {
  it('returns the model text when the provider answers', async () => {
    const answerer = createLlmAnswerer(canned('Customers report the mobile checkout is slow.'));
    expect(await answerer.compose('checkout?', evidence)).toBe('Customers report the mobile checkout is slow.');
  });

  it('grounds the model: the prompt carries only the supplied evidence', async () => {
    let seenPrompt = '';
    const answerer = createLlmAnswerer(
      provider(async (req) => {
        seenPrompt = req.prompt;
        return { text: 'ok', inputTokens: 1, outputTokens: 1, modelVersion: 'm' };
      }),
    );
    await answerer.compose('checkout?', evidence);
    expect(seenPrompt).toContain('mobile checkout is slow');
    expect(seenPrompt).toContain('only the feedback');
  });

  it('falls back to the baseline when the provider throws', async () => {
    const answerer = createLlmAnswerer(provider(async () => { throw new Error('vertex down'); }));
    const out = await answerer.compose('checkout?', evidence);
    expect(out).toMatch(/Based on 1 response/); // baseline phrasing
  });

  it('falls back when the model returns empty text', async () => {
    const out = await createLlmAnswerer(canned('   ')).compose('checkout?', evidence);
    expect(out).toMatch(/Based on 1 response/);
  });

  it('falls back when the safety check rejects the output', async () => {
    const answerer = createLlmAnswerer(canned('unsafe text'), {
      safety: { check: () => ({ safe: false, reason: 'blocked' }) },
    });
    const out = await answerer.compose('checkout?', evidence);
    expect(out).toMatch(/Based on 1 response/);
  });

  it('empty evidence never calls the provider (baseline handles it)', async () => {
    let called = false;
    const answerer = createLlmAnswerer(provider(async () => { called = true; return { text: 'x', inputTokens: 0, outputTokens: 0, modelVersion: 'm' }; }));
    const out = await answerer.compose('anything?', []);
    expect(called).toBe(false);
    expect(out).toMatch(/does not support an answer/);
  });

  it('integrates with answerQuery: model shapes the prose, citations/confidence stay deterministic', async () => {
    const corpus = [
      rec({ recordId: 'r1', accountId: 'a1', commentText: 'mobile checkout is slow' }),
      rec({ recordId: 'r2', accountId: 'a1', commentText: 'the mobile checkout crashes' }),
      rec({ recordId: 'r3', accountId: 'a2', commentText: 'other account note' }),
    ];
    const ans = await answerQuery(corpus, 'a1', 'mobile checkout', createLlmAnswerer(canned('Two customers flag mobile checkout problems.')));
    expect(ans.answer).toBe('Two customers flag mobile checkout problems.');
    expect(ans.citations.map((c) => c.recordId).sort()).toEqual(['r1', 'r2']); // INV-6: no r3
    expect(ans.supported).toBe(true);
    expect(ans.confidence).toBeGreaterThan(0);
  });
});
