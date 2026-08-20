/**
 * Claude-via-Vertex provider — a real implementation of the domain's `LLMProvider`
 * seam (llmGateway.ts). Authenticates with Application Default Credentials (on Cloud
 * Run, the runtime service account, which needs roles/aiplatform.user), so no API key
 * is handled in the app. This is infra (network + external SDK), so it is not unit
 * tested against live Vertex — the domain code that uses it is tested with a mock
 * provider, and the deterministic baselines remain the fallback.
 */
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
import type { LLMProvider, LLMRequest, LLMResponse } from '../domain/llmGateway.js';

export interface VertexProviderConfig {
  projectId: string;
  /** Vertex region, e.g. 'us-central1' (US residency, DPS-9), or 'global'. */
  region: string;
  /** Model id as published in Vertex Model Garden, e.g. 'claude-3-5-sonnet-v2@20241022'. */
  model: string;
}

export function createVertexProvider(config: VertexProviderConfig): LLMProvider {
  const client = new AnthropicVertex({ projectId: config.projectId, region: config.region });

  return {
    async complete(request: LLMRequest): Promise<LLMResponse> {
      const message = await client.messages.create({
        model: config.model,
        max_tokens: request.maxOutputTokens,
        ...(request.system !== undefined ? { system: request.system } : {}),
        messages: [{ role: 'user', content: request.prompt }],
      });

      const text = message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');

      return {
        text,
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        modelVersion: message.model,
      };
    },
  };
}
