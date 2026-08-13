/**
 * LLM gateway — the single place model calls happen (provider-abstracted, DPS-9).
 * Wraps a provider (Claude via Vertex AI, wired later) and enforces the
 * conversational endpoint's guards: a per-link token budget (cost ceiling),
 * output content-safety checks, and — together with abuseDefense's rate limiter —
 * the R-45 protections. Scope control (R-8) layers on top of this.
 *
 * The provider is a seam: tests use a deterministic stub; production swaps in the
 * real Claude provider without touching callers (no lock-in).
 */
import { invariant } from './assert.js';

export interface LLMRequest {
  system?: string;
  prompt: string;
  maxOutputTokens: number;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  modelVersion: string;
}

/** The seam to the model provider (Claude via Vertex AI). Wired later. */
export interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
}

export interface SafetyVerdict {
  safe: boolean;
  reason?: string;
}

/** Output content-safety check (R-45). */
export interface SafetyChecker {
  check(text: string): SafetyVerdict;
}

export interface GatewayConfig {
  /** Per-link/session token budget — the cost ceiling (R-45). */
  tokenBudget: number;
}

export type GatewayResult =
  | { ok: true; response: LLMResponse }
  | { ok: false; denied: 'budget_exceeded' | 'unsafe_output'; reason?: string };

/**
 * A budget- and safety-enforcing wrapper around an LLM provider. Tracks tokens
 * spent against the ceiling and refuses a call that would exceed it BEFORE
 * spending; runs every output through the safety checker and withholds unsafe
 * text. Enforcement is independent of which provider is behind it.
 */
export class LLMGateway {
  private spent = 0;

  constructor(
    private readonly provider: LLMProvider,
    private readonly safety: SafetyChecker,
    private readonly config: GatewayConfig,
  ) {
    invariant(config.tokenBudget > 0, 'token budget must be positive');
  }

  get spentTokens(): number {
    return this.spent;
  }

  get remainingTokens(): number {
    return Math.max(0, this.config.tokenBudget - this.spent);
  }

  async complete(request: LLMRequest): Promise<GatewayResult> {
    // Cost ceiling: refuse if the worst-case cost would breach the budget (R-45).
    const worstCase = request.maxOutputTokens;
    if (this.spent + worstCase > this.config.tokenBudget) {
      return { ok: false, denied: 'budget_exceeded', reason: `would exceed budget of ${this.config.tokenBudget}` };
    }

    const response = await this.provider.complete(request);
    this.spent += response.inputTokens + response.outputTokens;

    const verdict = this.safety.check(response.text);
    if (!verdict.safe) {
      return { ok: false, denied: 'unsafe_output', reason: verdict.reason };
    }
    return { ok: true, response };
  }
}

/**
 * A bounded conversational session (R-45): caps the number of exchanges and runs
 * every turn through the gateway (budget + safety). The interviewer's staying in
 * scope / ignoring injected instructions is R-8, layered separately.
 */
export class ConversationSession {
  private exchanges = 0;

  constructor(
    private readonly gateway: LLMGateway,
    private readonly maxExchanges: number,
  ) {
    invariant(maxExchanges > 0, 'maxExchanges must be positive');
  }

  get exchangeCount(): number {
    return this.exchanges;
  }

  /** True once the session has reached its exchange cap or run out of budget (R-9/R-45). */
  get isComplete(): boolean {
    return this.exchanges >= this.maxExchanges || this.gateway.remainingTokens === 0;
  }

  async ask(request: LLMRequest): Promise<GatewayResult | { ok: false; denied: 'session_complete' }> {
    if (this.isComplete) return { ok: false, denied: 'session_complete' };
    this.exchanges += 1;
    return this.gateway.complete(request);
  }
}
