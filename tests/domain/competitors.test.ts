/**
 * Competitor configuration. Built in Phase 4, increment 17.
 * Covers: R-24.
 */
import { describe, it, expect } from 'vitest';
import { addCompetitor, removeCompetitor, trackedCompetitors, matchesBrand, type Competitor } from '../../src/domain/competitors';

const rival = (over: Partial<Competitor> = {}): Competitor => ({
  brandId: 'c1',
  name: 'Rival Co',
  aliases: ['RivalCo', 'Rival'],
  tracked: true,
  ...over,
});

describe('competitor config (R-24)', () => {
  it('R-24: add and remove competitors, de-duplicating by brandId', () => {
    let list = addCompetitor([], rival());
    list = addCompetitor(list, rival({ name: 'Rival Co Renamed' })); // same id -> replace
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('Rival Co Renamed');
    expect(removeCompetitor(list, 'c1')).toHaveLength(0);
  });

  it('R-24: lists only tracked competitors', () => {
    const list = [rival({ brandId: 'c1', tracked: true }), rival({ brandId: 'c2', tracked: false })];
    expect(trackedCompetitors(list).map((c) => c.brandId)).toEqual(['c1']);
  });

  it('R-24: matches a brand by name or alias, case-insensitively', () => {
    expect(matchesBrand(rival(), 'I switched from rivalco last year')).toBe(true);
    expect(matchesBrand(rival(), 'no mention here')).toBe(false);
  });
});
