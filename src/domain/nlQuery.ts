/**
 * Grounded natural-language "ask your data" query.
 *
 * Requirements:
 *  - R-17:  answer a natural-language question grounded ONLY in the account's own
 *           data, with citations.
 *  - INV-6: each account's data is isolated; the answer is grounded only in that
 *           account's records — enforced structurally (scope-by-accountId) and by a
 *           runtime invariant on every citation.
 *  - E-8:   an ambiguous / unanswerable query answers only what the data supports and
 *           states what it cannot determine.
 *  - NFR-6: every answer carries the evidence behind it and a confidence signal.
 *
 * The retrieval, citation, isolation and limits logic here is deterministic and fully
 * tested. Turning the retrieved evidence into fluent prose is the model's job: it plugs
 * in behind the `GroundedAnswerer` seam (Claude via the LLM gateway in production; a
 * deterministic baseline for tests and offline use), and it is ONLY ever handed
 * account-scoped evidence — so no phrasing step can cross the tenant boundary.
 */
import type { FeedbackRecord, SourceType } from './feedbackRecord.js';
import { invariant } from './assert.js';

export interface Citation {
  recordId: string;
  brandId: string;
  sourceType: SourceType;
  /** A short verbatim snippet from the cited response (NFR-6). */
  snippet: string;
}

export interface GroundedAnswer {
  accountId: string;
  answer: string;
  citations: Citation[];
  /** 0..1 (NFR-6). Low when the supporting evidence is thin. */
  confidence: number;
  /** false when the account's data cannot answer the question (E-8). */
  supported: boolean;
  /** What the data cannot determine, when relevant (E-8). */
  caveat?: string;
}

/**
 * The phrasing seam: compose an answer from evidence that is ALREADY account-scoped.
 * Async because composing prose is the model's job (Claude via Vertex in production;
 * a deterministic baseline for tests/offline). The evidence handed in is always
 * account-scoped, so no phrasing step can cross the tenant boundary (INV-6).
 */
export interface GroundedAnswerer {
  compose(query: string, evidence: readonly FeedbackRecord[]): Promise<string>;
}

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'of', 'to', 'in', 'on', 'and', 'or', 'my', 'our', 'what', 'how', 'why', 'about', 'with', 'for']);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function overlap(queryTerms: readonly string[], text: string): number {
  const t = new Set(tokens(text));
  return queryTerms.reduce((n, q) => n + (t.has(q) ? 1 : 0), 0);
}

function snippetOf(text: string, max = 140): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

function toCitation(r: FeedbackRecord): Citation {
  return { recordId: r.recordId, brandId: r.brandId, sourceType: r.sourceType, snippet: snippetOf(r.commentText ?? '') };
}

/**
 * Retrieve the most relevant responses for a query — scoped to ONE account (INV-6).
 * Records with no comment text or no term overlap are excluded.
 */
export function retrieveEvidence(
  records: readonly FeedbackRecord[],
  accountId: string,
  query: string,
  limit = 5,
): FeedbackRecord[] {
  const terms = tokens(query);
  if (terms.length === 0) return [];
  return records
    .filter((r) => r.accountId === accountId && !!r.commentText) // INV-6: this account only
    .map((r) => ({ r, score: overlap(terms, r.commentText ?? '') }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.r.recordId.localeCompare(b.r.recordId))
    .slice(0, limit)
    .map((x) => x.r);
}

/** A deterministic answerer — a real implementation of the seam for tests/offline. */
export const baselineAnswerer: GroundedAnswerer = {
  async compose(query: string, evidence: readonly FeedbackRecord[]): Promise<string> {
    if (evidence.length === 0) return 'The available data does not support an answer to that question.';
    return `Based on ${evidence.length} response(s) in your account: ${evidence.map((e) => `"${snippetOf(e.commentText ?? '', 80)}"`).join('; ')}.`;
  },
};

function confidenceFrom(n: number): number {
  // thin evidence → low confidence; saturates toward 1 as support grows (NFR-6).
  return Math.min(1, n / 5);
}

/**
 * Answer a natural-language question grounded only in the account's own data (R-17).
 * Returns citations and a confidence signal (NFR-6); when the data can't answer,
 * `supported` is false and a caveat says so (E-8).
 */
export async function answerQuery(
  records: readonly FeedbackRecord[],
  accountId: string,
  query: string,
  answerer: GroundedAnswerer = baselineAnswerer,
): Promise<GroundedAnswer> {
  const evidence = retrieveEvidence(records, accountId, query);

  if (evidence.length === 0) {
    return {
      accountId,
      answer: 'The available data does not support an answer to that question.',
      citations: [],
      confidence: 0,
      supported: false,
      caveat: 'No responses in this account match the question.',
    };
  }

  // INV-6: every piece of evidence must belong to this account — no cross-tenant leak.
  for (const e of evidence) {
    invariant(e.accountId === accountId, `grounding leaked outside account ${accountId}`);
  }

  const citations = evidence.map(toCitation);
  const answer: GroundedAnswer = {
    accountId,
    answer: await answerer.compose(query, evidence),
    citations,
    confidence: confidenceFrom(evidence.length),
    supported: true,
  };
  // E-8: thin evidence answers only what it can, and says the support is limited.
  if (evidence.length < 2) {
    answer.caveat = `Limited data: this is based on a single response, so it may not be representative.`;
  }
  return answer;
}
