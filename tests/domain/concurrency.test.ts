/**
 * Optimistic concurrency. Built in Phase 4, increment 16.
 * Covers: E-11.
 */
import { describe, it, expect } from 'vitest';
import { applyEdit, type Versioned } from '../../src/domain/concurrency';

interface Survey extends Versioned {
  title: string;
}

describe('applyEdit (E-11)', () => {
  it('E-11: an edit on the current version succeeds and bumps the version', () => {
    const current: Survey = { title: 'A', version: 3 };
    const result = applyEdit(current, 3, (s) => ({ ...s, title: 'B' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.next.title).toBe('B');
      expect(result.next.version).toBe(4);
    }
  });

  it('E-11: a stale edit is rejected as a conflict — no silent overwrite', () => {
    const current: Survey = { title: 'A', version: 5 };
    const result = applyEdit(current, 3, (s) => ({ ...s, title: 'B' }));
    expect(result).toEqual({ ok: false, conflict: true, currentVersion: 5 });
  });
});
