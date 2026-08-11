/**
 * Survey definition — question types, validation, conditional logic.
 * Built in Phase 4, increment 3. Covers: R-1, R-3, R-31.
 */
import { describe, it, expect } from 'vitest';
import {
  brandLoveQuestion,
  trustQuestion,
  validateSurvey,
  supportsRequiredTypes,
  isQuestionVisible,
  visibleQuestions,
  BRAND_LOVE_SCALE,
  TRUST_DRIVERS,
  type Survey,
  type Question,
} from '../../src/domain/survey';

function baseSurvey(questions: Question[]): Survey {
  return { id: 's1', title: 'Test', questions };
}

describe('question types (R-1)', () => {
  it('R-1: a survey can include all required question types incl. Brand Love and Trust', () => {
    const survey = baseSurvey([
      { id: 'q1', type: 'single_select', prompt: 'pick one', options: ['a', 'b'] },
      { id: 'q2', type: 'multi_select', prompt: 'pick many', options: ['a', 'b', 'c'] },
      { id: 'q3', type: 'rating', prompt: 'rate us' },
      { id: 'q4', type: 'open_text', prompt: 'tell us more' },
      brandLoveQuestion('q5', 'How do you feel about the brand?'),
      trustQuestion('q6', 'How much do you trust the brand?'),
    ]);
    expect(supportsRequiredTypes(survey)).toBe(true);
    expect(validateSurvey(survey)).toEqual([]);
  });

  it('R-1: the Brand Love question carries the full five-point scale', () => {
    const q = brandLoveQuestion('q5', 'feel?');
    expect(q.options).toEqual([...BRAND_LOVE_SCALE]);
  });

  it('R-1: a select question with fewer than two options is invalid', () => {
    const errors = validateSurvey(baseSurvey([{ id: 'q1', type: 'single_select', prompt: 'x', options: ['only'] }]));
    expect(errors.some((e) => /two options/.test(e.message))).toBe(true);
  });
});

describe('Trust question type (R-31)', () => {
  it('R-31: supports a single-item rating and an optional four-driver battery', () => {
    const withDrivers = trustQuestion('t1', 'trust?', true);
    expect(withDrivers.trustDrivers).toEqual([...TRUST_DRIVERS]);
    expect(withDrivers.trustDrivers).toHaveLength(4);

    const singleItem = trustQuestion('t2', 'trust?', false);
    expect(singleItem.trustDrivers).toBeUndefined();
  });

  it('R-31: rejects an unknown trust driver', () => {
    const bad: Question = { id: 't3', type: 'trust', prompt: 'trust?', trustDrivers: ['reliability', 'bogus' as never] };
    const errors = validateSurvey(baseSurvey([bad]));
    expect(errors.some((e) => /unknown trust driver/.test(e.message))).toBe(true);
  });
});

describe('conditional logic (R-3)', () => {
  const survey = baseSurvey([
    { id: 'q1', type: 'single_select', prompt: 'Are you a customer?', options: ['yes', 'no'] },
    { id: 'q2', type: 'open_text', prompt: 'Why did you leave?', showIf: { questionId: 'q1', equals: 'no' } },
  ]);

  it('R-3: a gated question is shown only when the prior answer matches', () => {
    expect(isQuestionVisible(survey.questions[1]!, { q1: 'no' })).toBe(true);
    expect(isQuestionVisible(survey.questions[1]!, { q1: 'yes' })).toBe(false);
  });

  it('R-3: with no answer yet, a gated question is not shown; ungated always shows', () => {
    expect(visibleQuestions(survey, {}).map((q) => q.id)).toEqual(['q1']);
    expect(visibleQuestions(survey, { q1: 'no' }).map((q) => q.id)).toEqual(['q1', 'q2']);
  });

  it('R-3: a showIf referencing a later or unknown question is invalid', () => {
    const bad = baseSurvey([
      { id: 'a', type: 'open_text', prompt: 'x', showIf: { questionId: 'b', equals: 'y' } },
      { id: 'b', type: 'single_select', prompt: 'y', options: ['y', 'n'] },
    ]);
    expect(validateSurvey(bad).some((e) => /earlier question/.test(e.message))).toBe(true);
  });
});
