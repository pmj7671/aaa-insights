/**
 * De-duplication of identical feedback. Built in Phase 4, increment 1.
 * Covers: R-13, E-6.
 */
import { describe, it, expect } from 'vitest';
import { dedupeRecords, dedupeKey } from '../../src/domain/dedup';

const rec = (sourceId: string, text: string, capturedAt: string) => ({ sourceId, text, capturedAt });

describe('dedupeRecords', () => {
  it('R-13/E-6: drops items identical on source + text + timestamp, keeping the first', () => {
    const items = [
      rec('web', 'great product', '2026-08-01T10:00:00Z'),
      rec('web', 'great product', '2026-08-01T10:00:00Z'), // exact duplicate
      rec('web', 'great product', '2026-08-01T10:05:00Z'), // different time -> kept
    ];
    const { kept, removed } = dedupeRecords(items);
    expect(kept).toHaveLength(2);
    expect(removed).toBe(1);
  });

  it('E-6: near-duplicates (different source or text) are NOT merged', () => {
    const items = [
      rec('web', 'good', '2026-08-01T10:00:00Z'),
      rec('csv', 'good', '2026-08-01T10:00:00Z'), // different source
      rec('web', 'good!', '2026-08-01T10:00:00Z'), // different text
    ];
    expect(dedupeRecords(items).kept).toHaveLength(3);
  });

  it('dedupeKey is stable for identical items', () => {
    expect(dedupeKey(rec('web', 'x', 't'))).toBe(dedupeKey(rec('web', 'x', 't')));
  });
});
