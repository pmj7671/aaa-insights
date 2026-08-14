/**
 * Data-quality gates over incoming feedback.
 * Requirements: E-1 (tiny sample → state low confidence, don't fabricate),
 * E-3 (junk/abusive text flagged and excluded by default), E-4 (non-English
 * detected, tagged, set aside — English-only MVP, D-4).
 */

// ---- E-1: sample adequacy ----

/** Below this, findings are flagged as too small to be reliable. */
export const DEFAULT_MIN_SAMPLE = 30;

export function sampleAdequacy(n: number, min = DEFAULT_MIN_SAMPLE): 'reliable' | 'too_small' {
  return n >= min ? 'reliable' : 'too_small';
}

// ---- E-3: junk / abusive ----

const ABUSE_TERMS = ['idiot', 'stupid', 'scam', 'garbage', 'trash', 'moron'];

/** Structural junk: empty, symbols-only, or spammy repetition. */
export function isJunk(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return true;
  if (!/[a-z0-9]/i.test(t)) return true; // no alphanumeric content
  if (/(.)\1{6,}/.test(t)) return true; // one char repeated 7+ times
  return false;
}

/** Lightweight abusive-language check (baseline; a fuller model plugs in later). */
export function isAbusive(text: string): boolean {
  const t = text.toLowerCase();
  return ABUSE_TERMS.some((w) => t.includes(w));
}

export type QualityFlag = 'junk' | 'abuse';

/** Quality flags for a comment; flagged items are excluded from analysis by default. */
export function qualityFlags(text: string): QualityFlag[] {
  const flags: QualityFlag[] = [];
  if (isJunk(text)) flags.push('junk');
  if (isAbusive(text)) flags.push('abuse');
  return flags;
}

// ---- E-4: language ----

/** Heuristic English check: has Latin letters and few non-ASCII characters. */
export function isLikelyEnglish(text: string): boolean {
  const letters = (text.match(/[a-z]/gi) ?? []).length;
  if (letters === 0) return false;
  const nonAscii = (text.match(/[^\x00-\x7F]/g) ?? []).length;
  return nonAscii / Math.max(1, text.length) < 0.2;
}

/** Tag a comment's language (MVP: English vs non-English). Non-English is set aside (E-4). */
export function languageTag(text: string): 'en' | 'non_en' {
  return isLikelyEnglish(text) ? 'en' : 'non_en';
}
