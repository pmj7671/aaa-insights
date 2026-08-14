/**
 * Data-quality gates. Built in Phase 4, increment 16.
 * Covers: E-1, E-3, E-4.
 */
import { describe, it, expect } from 'vitest';
import { sampleAdequacy, isJunk, isAbusive, qualityFlags, languageTag } from '../../src/domain/dataQuality';

describe('sampleAdequacy (E-1)', () => {
  it('E-1: a tiny sample is flagged too small; a large one is reliable', () => {
    expect(sampleAdequacy(5, 30)).toBe('too_small');
    expect(sampleAdequacy(50, 30)).toBe('reliable');
  });
});

describe('junk / abuse (E-3)', () => {
  it('E-3: empty, symbols-only, and spam-repetition are junk', () => {
    expect(isJunk('')).toBe(true);
    expect(isJunk('!!!')).toBe(true);
    expect(isJunk('aaaaaaaa')).toBe(true);
    expect(isJunk('the support was great')).toBe(false);
  });
  it('E-3: abusive language is flagged; flags combine', () => {
    expect(isAbusive('this is a scam')).toBe(true);
    expect(qualityFlags('!!!')).toEqual(['junk']);
    expect(qualityFlags('the product is great')).toEqual([]);
  });
});

describe('language (E-4)', () => {
  it('E-4: English is tagged en; non-Latin text is set aside as non_en', () => {
    expect(languageTag('the product is fast and reliable')).toBe('en');
    expect(languageTag('これはテストです')).toBe('non_en');
  });
});
