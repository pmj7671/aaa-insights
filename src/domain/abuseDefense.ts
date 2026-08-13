/**
 * Abuse defense for public endpoints — rate limiting, one-response-per-link
 * tokens, and duplication detection, WITHOUT a CAPTCHA wall (protect NFR-4).
 * Requirements: R-41, and supports E-9 (a real spike vs ballot-stuffing).
 *
 * Pure and deterministic: the caller supplies the current time (ms), so behaviour
 * is fully testable and reproducible.
 */

// ---- Token-bucket rate limiter ----

export interface Bucket {
  tokens: number;
  lastMs: number;
}

export interface RateLimit {
  /** Max burst. */
  capacity: number;
  /** Sustained refill rate. */
  refillPerSec: number;
}

export function createBucket(capacity: number, atMs: number): Bucket {
  return { tokens: capacity, lastMs: atMs };
}

/**
 * Attempt to consume `cost` tokens at time `nowMs`. Refills based on elapsed time
 * up to capacity, then allows or denies. Returns the next bucket state either way
 * (deterministic; no side effects).
 */
export function consume(
  bucket: Bucket,
  limit: RateLimit,
  nowMs: number,
  cost = 1,
): { allowed: boolean; bucket: Bucket } {
  const elapsedSec = Math.max(0, (nowMs - bucket.lastMs) / 1000);
  const refilled = Math.min(limit.capacity, bucket.tokens + elapsedSec * limit.refillPerSec);
  if (refilled >= cost) {
    return { allowed: true, bucket: { tokens: refilled - cost, lastMs: nowMs } };
  }
  return { allowed: false, bucket: { tokens: refilled, lastMs: nowMs } };
}

// ---- One-response-per-link tokens ----

/**
 * Redeem a single-use survey-link token. Returns ok=false if it was already used
 * (blocks link stuffing) and the updated set of used tokens.
 */
export function redeemToken(
  used: ReadonlySet<string>,
  token: string,
): { ok: boolean; used: Set<string> } {
  if (used.has(token)) return { ok: false, used: new Set(used) };
  const next = new Set(used);
  next.add(token);
  return { ok: true, used: next };
}

// ---- Duplication detection ----

/** A stable signature for a submission (source + text + link), for dedup (E-6/E-9). */
export function submissionSignature(parts: { linkId: string; text: string }): string {
  return `${parts.linkId}${parts.text.trim().toLowerCase()}`;
}

/** Whether a signature has been seen before (a duplicate/coordinated submission). */
export function isDuplicate(seen: ReadonlySet<string>, signature: string): boolean {
  return seen.has(signature);
}
