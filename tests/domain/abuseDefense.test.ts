/**
 * Abuse defense. Built in Phase 4, increment 10.
 * Covers: R-41 (rate limiting, one-per-link tokens, duplication) without CAPTCHA.
 */
import { describe, it, expect } from 'vitest';
import {
  createBucket,
  consume,
  redeemToken,
  submissionSignature,
  isDuplicate,
  type RateLimit,
} from '../../src/domain/abuseDefense';

describe('rate limiter (R-41)', () => {
  const limit: RateLimit = { capacity: 2, refillPerSec: 1 };

  it('R-41: allows a burst up to capacity, then denies until refill', () => {
    let b = createBucket(limit.capacity, 0);
    const a1 = consume(b, limit, 0); b = a1.bucket;
    const a2 = consume(b, limit, 0); b = a2.bucket;
    const a3 = consume(b, limit, 0); b = a3.bucket;
    expect([a1.allowed, a2.allowed, a3.allowed]).toEqual([true, true, false]);
  });

  it('R-41: refills over time and allows again', () => {
    let b = createBucket(0, 0); // empty
    const denied = consume(b, limit, 0); b = denied.bucket;
    expect(denied.allowed).toBe(false);
    const later = consume(b, limit, 1000); // +1s -> 1 token
    expect(later.allowed).toBe(true);
  });
});

describe('one-response-per-link tokens (R-41)', () => {
  it('R-41: a link token can be redeemed once, blocking stuffing', () => {
    const first = redeemToken(new Set(), 'tok-1');
    expect(first.ok).toBe(true);
    const second = redeemToken(first.used, 'tok-1');
    expect(second.ok).toBe(false);
  });
});

describe('duplication detection (R-41)', () => {
  it('R-41: identical submissions on the same link share a signature', () => {
    const sig = submissionSignature({ linkId: 'L1', text: '  Great! ' });
    expect(isDuplicate(new Set([sig]), submissionSignature({ linkId: 'L1', text: 'great!' }))).toBe(true);
    expect(isDuplicate(new Set([sig]), submissionSignature({ linkId: 'L2', text: 'great!' }))).toBe(false);
  });
});
