/**
 * CSV import into the unified hub. Built in Phase 4, increment 6.
 * Covers: R-11, E-5, INV-1 (via record validation).
 */
import { describe, it, expect } from 'vitest';
import { parseCsv, importCsv, type ColumnMapping, type ImportContext } from '../../src/domain/csvImport';

const mapping: ColumnMapping = {
  capturedAt: 'date',
  rating: 'score',
  ratingScale: 'scale',
  brandLove: 'love',
  comment: 'comment',
  segment: 'segment',
};
const ctx: ImportContext = { accountId: 'acc1', sourceId: 'batch1', defaultBrandId: 'own' };

describe('parseCsv', () => {
  it('handles quoted fields with commas, newlines, and escaped quotes', () => {
    const rows = parseCsv('a,b\n"x,y","he said ""hi""\nnext"');
    expect(rows[0]).toEqual(['a', 'b']);
    expect(rows[1]).toEqual(['x,y', 'he said "hi"\nnext']);
  });
});

describe('importCsv (R-11)', () => {
  it('R-11: maps columns to unified records and normalises rating + Brand Love', () => {
    const csv = [
      'date,score,scale,love,comment,segment',
      '2026-08-01T10:00:00Z,10,10_pt,Love,great support,enterprise',
    ].join('\n');
    const { records, errors } = importCsv(csv, mapping, ctx);
    expect(errors).toEqual([]);
    expect(records).toHaveLength(1);
    const rec = records[0]!;
    expect(rec.brandId).toBe('own');
    expect(rec.sourceType).toBe('import_csv');
    expect(rec.ratingNorm).toBe(5); // 10 on a 10-point scale -> 5
    expect(rec.brandLove).toBe('love');
    expect(rec.commentText).toBe('great support');
  });

  it('E-5: malformed rows and bad ratings become per-row errors; valid rows still import', () => {
    const csv = [
      'date,score,scale,love,comment,segment',
      '2026-08-01T10:00:00Z,5,5_star,like,ok,smb', // valid
      '2026-08-02T10:00:00Z,notanumber,5_star,like,bad,smb', // bad rating
      'too,few,columns', // malformed
    ].join('\n');
    const { records, errors } = importCsv(csv, mapping, ctx);
    expect(records).toHaveLength(1); // partial acceptance
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatchObject({ row: 2 });
    expect(errors[1]).toMatchObject({ row: 3 });
  });

  it('INV-1: a row with no brand (and no default) is rejected with an attribution error', () => {
    const noBrandCtx: ImportContext = { accountId: 'acc1', sourceId: 'batch1' }; // no defaultBrandId
    const csv = ['date,score,scale', '2026-08-01T10:00:00Z,5,5_star'].join('\n');
    const { records, errors } = importCsv(csv, { capturedAt: 'date', rating: 'score', ratingScale: 'scale' }, noBrandCtx);
    expect(records).toHaveLength(0);
    expect(errors[0]?.message).toMatch(/brand/i);
  });

  it('reports a missing mapped header rather than guessing', () => {
    const { errors } = importCsv('a,b\n1,2', mapping, ctx);
    expect(errors[0]).toMatchObject({ row: 0 });
  });
});
