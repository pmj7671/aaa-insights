/**
 * Survey definition — question types, the Brand Love scale, the Trust battery,
 * validation, and conditional (show/skip) logic.
 * Requirements: R-1 (question types), R-3 (conditional logic), R-31 (Trust
 * question type: single item + optional driver battery).
 */
import type { BrandLoveLabel } from './types.js';

export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'rating'
  | 'open_text'
  | 'brand_love'
  | 'trust';

/** The question types a survey MUST be able to include (R-1). */
export const REQUIRED_QUESTION_TYPES: readonly QuestionType[] = [
  'single_select',
  'multi_select',
  'rating',
  'open_text',
  'brand_love',
  'trust',
];

/** The fixed Brand Love scale, highest→lowest (D-9). */
export const BRAND_LOVE_SCALE: readonly BrandLoveLabel[] = [
  'love',
  'like',
  'ambivalence',
  'dislike',
  'hate',
];

/** The four Trust drivers (R-31, O-12). */
export type TrustDriver = 'reliability' | 'integrity' | 'benevolence' | 'security_privacy';
export const TRUST_DRIVERS: readonly TrustDriver[] = [
  'reliability',
  'integrity',
  'benevolence',
  'security_privacy',
];

/**
 * A condition that gates a question's visibility (R-3): the question is shown
 * only when the answer to `questionId` equals `equals`. Absent = always shown.
 */
export interface ShowIf {
  questionId: string;
  equals: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Options for single/multi-select. */
  options?: string[];
  /** For a Trust question: include the optional driver battery (R-31). */
  trustDrivers?: TrustDriver[];
  /** Conditional visibility (R-3). */
  showIf?: ShowIf;
}

export interface Survey {
  id: string;
  title: string;
  questions: Question[];
}

/** Build the standard Brand Love question (R-1). */
export function brandLoveQuestion(id: string, prompt: string): Question {
  return { id, type: 'brand_love', prompt, options: [...BRAND_LOVE_SCALE] };
}

/**
 * Build a Trust question: a single-item trust rating, plus (optionally) the
 * four-driver battery (R-31). `withDrivers=false` yields the single item alone.
 */
export function trustQuestion(id: string, prompt: string, withDrivers = true): Question {
  return withDrivers
    ? { id, type: 'trust', prompt, trustDrivers: [...TRUST_DRIVERS] }
    : { id, type: 'trust', prompt };
}

export interface ValidationError {
  questionId: string;
  message: string;
}

/**
 * Validate a survey's questions are well-formed. Returns an empty array when the
 * survey is valid. (Structural validation only — content quality is the author's.)
 */
export function validateSurvey(survey: Survey): ValidationError[] {
  const errors: ValidationError[] = [];
  const ids = new Set<string>();

  for (const q of survey.questions) {
    if (ids.has(q.id)) errors.push({ questionId: q.id, message: 'duplicate question id' });
    ids.add(q.id);

    if (q.type === 'single_select' || q.type === 'multi_select') {
      if (!q.options || q.options.length < 2) {
        errors.push({ questionId: q.id, message: 'select questions need at least two options' });
      }
    }
    if (q.type === 'brand_love') {
      const ok = q.options && q.options.length === BRAND_LOVE_SCALE.length &&
        BRAND_LOVE_SCALE.every((l) => q.options!.includes(l));
      if (!ok) errors.push({ questionId: q.id, message: 'brand_love must use the five-point scale' });
    }
    if (q.type === 'trust' && q.trustDrivers) {
      const bad = q.trustDrivers.filter((d) => !TRUST_DRIVERS.includes(d));
      if (bad.length) errors.push({ questionId: q.id, message: `unknown trust driver(s): ${bad.join(', ')}` });
    }
  }

  // Conditional references must point at an earlier, existing question (R-3).
  const seen = new Set<string>();
  for (const q of survey.questions) {
    if (q.showIf) {
      if (!ids.has(q.showIf.questionId)) {
        errors.push({ questionId: q.id, message: `showIf references unknown question ${q.showIf.questionId}` });
      } else if (!seen.has(q.showIf.questionId)) {
        errors.push({ questionId: q.id, message: `showIf must reference an earlier question` });
      }
    }
    seen.add(q.id);
  }

  return errors;
}

/** Whether a survey structurally supports every required question type (R-1). */
export function supportsRequiredTypes(survey: Survey): boolean {
  const present = new Set(survey.questions.map((q) => q.type));
  return REQUIRED_QUESTION_TYPES.every((t) => present.has(t));
}

/**
 * Evaluate a question's visibility against the answers so far (R-3). A question
 * with no `showIf` is always visible; otherwise it is shown only when the
 * referenced answer exactly equals the expected value.
 */
export function isQuestionVisible(question: Question, answers: Readonly<Record<string, string>>): boolean {
  if (!question.showIf) return true;
  return answers[question.showIf.questionId] === question.showIf.equals;
}

/** The questions currently visible given the answers (R-3). */
export function visibleQuestions(survey: Survey, answers: Readonly<Record<string, string>>): Question[] {
  return survey.questions.filter((q) => isQuestionVisible(q, answers));
}
