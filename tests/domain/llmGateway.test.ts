/**
 * LLM gateway + conversational session. Built in Phase 4, increment 10.
 * Covers: R-45 (per-link cost ceiling, output safety, bounded session), DPS-9 seam.
 */
import { describe, it, expect } from 'vitest';
import {
  LLMGateway,
  ConversationSession,
  type LLMProvider,
  type SafetyChecker,
  type LLMRequest,
  type LLMResponse,
} from '../../src/domain/llmGateway';

/** Deterministic stub provider (stands in for Claude via Vertex). */
function stubProvider(text: string, inTok = 10, outTok = 20): LLMProvider {
  return {
    async complete(_req: LLMRequest): Promise<LLMResponse> {
      return { text, inputTokens: inTok, outputTokens: outTok, modelVersion: 'stub-1' };
    },
  };
}

const allowAll: SafetyChecker = { check: () => ({ safe: true }) };
const blockAll: SafetyChecker = { check: () => ({ safe: false, reason: 'blocked' }) };

const req: LLMRequest = { prompt: 'hi', maxOutputTokens: 20 };

describe('LLMGateway (R-45)', () => {
  it('R-45: returns the response and accounts tokens spent', async () => {
    const g = new LLMGateway(stubProvider('hello'), allowAll, { tokenBudget: 1000 });
    const result = await g.complete(req);
    expect(result.ok).toBe(true);
    expect(g.spentTokens).toBe(30);
  });

  it('R-45: refuses a call that would exceed the per-link budget (cost ceiling)', async () => {
    const g = new LLMGateway(stubProvider('hello'), allowAll, { tokenBudget: 15 });
    const result = await g.complete(req); // maxOutputTokens 20 > budget 15
    expect(result).toMatchObject({ ok: false, denied: 'budget_exceeded' });
    expect(g.spentTokens).toBe(0); // nothing spent
  });

  it('R-45: withholds unsafe output', async () => {
    const g = new LLMGateway(stubProvider('nasty'), blockAll, { tokenBudget: 1000 });
    const result = await g.complete(req);
    expect(result).toMatchObject({ ok: false, denied: 'unsafe_output' });
  });
});

describe('ConversationSession (R-45 / R-9)', () => {
  it('R-45: caps the number of exchanges', async () => {
    const g = new LLMGateway(stubProvider('ok'), allowAll, { tokenBudget: 10_000 });
    const session = new ConversationSession(g, 2);
    expect((await session.ask(req)).ok).toBe(true);
    expect((await session.ask(req)).ok).toBe(true);
    expect(session.isComplete).toBe(true);
    expect(await session.ask(req)).toMatchObject({ ok: false, denied: 'session_complete' });
    expect(session.exchangeCount).toBe(2);
  });
});
