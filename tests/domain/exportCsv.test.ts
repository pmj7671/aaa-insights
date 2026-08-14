/**
 * CSV export. Built in Phase 4, increment 15.
 * Covers: R-22.
 */
import { describe, it, expect } from 'vitest';
import { toCsv, csvCell } from '../../src/domain/exportCsv';

describe('csvCell', () => {
  it('R-22: quotes cells with commas, quotes, or newlines and escapes quotes', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvCell(null)).toBe('');
  });
});

describe('toCsv (R-22)', () => {
  it('R-22: serialises rows with a header, fixed column order, and escaping', () => {
    const csv = toCsv(
      [
        { theme: 'Support', count: 12, quote: 'great, fast' },
        { theme: 'Price', count: 5, quote: 'too "high"' },
      ],
      ['theme', 'count', 'quote'],
    );
    expect(csv).toBe('theme,count,quote\nSupport,12,"great, fast"\nPrice,5,"too ""high"""');
  });

  it('R-22: emits just the header for an empty set', () => {
    expect(toCsv([], ['a', 'b'])).toBe('a,b');
  });
});
