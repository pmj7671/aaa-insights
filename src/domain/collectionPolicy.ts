/**
 * Lawful & ethical collection gate.
 * Requirements: R-25 (collect public reviews subject to DPS-7 + a legal-review
 * gate), DPS-7 (public only, respect robots.txt, no bypassing auth/paywalls,
 * honor terms, written legal sign-off before live web collection), X-3
 * (no private/authenticated/paywalled content or terms-prohibited data),
 * INV-10 (public + lawful only).
 */
export interface CollectionSource {
  type: 'web' | 'api' | 'provider' | 'import_csv';
  isPublic: boolean;
  requiresAuth: boolean;
  isPaywalled: boolean;
  /** For web sources: whether robots.txt permits collection. */
  robotsAllowed: boolean;
  /** Whether the source's terms permit this use. */
  termsAllow: boolean;
  /** The client's written legal sign-off for live web collection (DPS-7). */
  legalSignoff: boolean;
}

export type CollectionDecision = { allow: true } | { allow: false; reason: string };

/**
 * Decide whether a source may be collected. Licensed providers / APIs / CSV are
 * allowed when their terms permit. Live web collection is the gated path: public
 * only, no auth/paywall bypass, robots + terms respected, and blocked until the
 * client's legal sign-off is in place (R-25, DPS-7, X-3).
 */
export function collectionDecision(source: CollectionSource): CollectionDecision {
  if (source.type !== 'web') {
    if (!source.termsAllow) return { allow: false, reason: 'source terms prohibit this use' };
    return { allow: true };
  }
  if (!source.isPublic) return { allow: false, reason: 'not publicly accessible (X-3)' };
  if (source.requiresAuth) return { allow: false, reason: 'requires authentication — no bypass (X-3)' };
  if (source.isPaywalled) return { allow: false, reason: 'paywalled — no bypass (X-3)' };
  if (!source.robotsAllowed) return { allow: false, reason: 'robots.txt disallows collection (DPS-7)' };
  if (!source.termsAllow) return { allow: false, reason: 'source terms prohibit collection (DPS-7)' };
  if (!source.legalSignoff) return { allow: false, reason: 'awaiting client legal sign-off (R-25/DPS-7)' };
  return { allow: true };
}
