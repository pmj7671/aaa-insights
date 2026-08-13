/**
 * PII detection & redaction — run over open text and transcripts BEFORE analysis
 * or surfacing, so personal data never reaches logs or AI outputs.
 * Requirements: R-44 (detect and redact PII), INV-8 (PII never in logs/outputs
 * unless the admin opts in), E-10 (admin-surfacing behind controls, elsewhere).
 */
export type PiiType = 'ssn' | 'credit_card' | 'email' | 'phone' | 'ip';

export interface PiiMatch {
  type: PiiType;
  value: string;
}

/**
 * Ordered patterns. SSN and credit-card run before phone so a 9/16-digit string
 * isn't mis-tagged as a phone number.
 */
const PATTERNS: { type: PiiType; re: RegExp }[] = [
  { type: 'ssn', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'credit_card', re: /\b(?:\d[ -]?){13,16}\b/g },
  { type: 'email', re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { type: 'phone', re: /\b(?:\+?\d{1,2}[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g },
  { type: 'ip', re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g },
];

/** Find all PII matches in text (in the order above). */
export function detectPii(text: string): PiiMatch[] {
  const matches: PiiMatch[] = [];
  for (const { type, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      matches.push({ type, value: m[0] });
    }
  }
  return matches;
}

export interface RedactionResult {
  redacted: string;
  found: Partial<Record<PiiType, number>>;
}

/**
 * Redact PII, replacing each match with `[REDACTED:TYPE]`. Patterns are applied
 * in order; once a span is redacted (letters only) later patterns can't re-match
 * it. Returns the redacted text and a count of what was found.
 */
export function redactPii(text: string): RedactionResult {
  let redacted = text;
  const found: Partial<Record<PiiType, number>> = {};
  for (const { type, re } of PATTERNS) {
    redacted = redacted.replace(re, (match) => {
      found[type] = (found[type] ?? 0) + 1;
      return `[REDACTED:${type.toUpperCase()}]`;
    });
  }
  return { redacted, found };
}

/** Whether any PII is present (for gating a "surface to admin" path — E-10). */
export function hasPii(text: string): boolean {
  return detectPii(text).length > 0;
}
