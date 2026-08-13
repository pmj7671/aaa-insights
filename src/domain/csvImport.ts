/**
 * CSV import into the unified feedback hub.
 * Requirements: R-11 (map columns to the unified schema), E-5 (malformed CSV is
 * rejected or partially accepted with a per-row error report), INV-1 (attribution).
 *
 * Pure parsing + mapping only — persistence is a separate (infrastructure) concern.
 */
import { normalizeRating } from './ratings.js';
import { normalizeLoveLabel } from './brandLove.js';
import { validateFeedbackRecord, type FeedbackRecord } from './feedbackRecord.js';
import type { RatingScale } from './types.js';

/**
 * Parse CSV text into rows of cells (RFC-4180-ish): handles quoted fields,
 * embedded commas/newlines, and doubled "" escapes. Normalises CRLF/CR to LF.
 */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Maps unified fields to CSV column header names. */
export interface ColumnMapping {
  brandId?: string;
  capturedAt: string;
  rating?: string;
  ratingScale?: string;
  brandLove?: string;
  comment?: string;
  segment?: string;
}

export interface ImportContext {
  accountId: string;
  sourceId: string;
  /** Used when the CSV has no per-row brand column (e.g. a single-brand import). */
  defaultBrandId?: string;
  /** Used when the CSV has no per-row scale column. */
  defaultScale?: RatingScale;
}

export interface RowError {
  /** 1-based data-row number (excludes the header). */
  row: number;
  message: string;
}

export interface ImportResult {
  records: FeedbackRecord[];
  errors: RowError[];
}

/**
 * Import CSV feedback: map columns to unified FeedbackRecords, normalising
 * ratings (E-15) and Brand Love labels. Valid rows become records; each invalid
 * or malformed row becomes a RowError (E-5) — partial acceptance, never a silent
 * drop.
 */
export function importCsv(csvText: string, mapping: ColumnMapping, ctx: ImportContext): ImportResult {
  const rows = parseCsv(csvText);
  const records: FeedbackRecord[] = [];
  const errors: RowError[] = [];

  if (rows.length === 0) return { records, errors };

  const header = rows[0]!.map((h) => h.trim());
  const col = (name: string | undefined): number => (name ? header.indexOf(name) : -1);

  const idx = {
    brandId: col(mapping.brandId),
    capturedAt: col(mapping.capturedAt),
    rating: col(mapping.rating),
    ratingScale: col(mapping.ratingScale),
    brandLove: col(mapping.brandLove),
    comment: col(mapping.comment),
    segment: col(mapping.segment),
  };

  if (idx.capturedAt === -1) {
    errors.push({ row: 0, message: `mapped column "${mapping.capturedAt}" (capturedAt) not found in header` });
    return { records, errors };
  }

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]!;
    const dataRow = r; // 1-based data row

    // Malformed: wrong number of columns (E-5).
    if (cells.length !== header.length) {
      errors.push({ row: dataRow, message: `expected ${header.length} columns, found ${cells.length}` });
      continue;
    }

    const at = (i: number): string | undefined => (i >= 0 ? cells[i]?.trim() : undefined);

    const brandId = idx.brandId >= 0 ? at(idx.brandId) : ctx.defaultBrandId;
    const scale = (at(idx.ratingScale) as RatingScale | undefined) ?? ctx.defaultScale;
    const ratingRawStr = at(idx.rating);

    let ratingRaw: number | undefined;
    let ratingNorm: number | null | undefined;
    if (ratingRawStr !== undefined && ratingRawStr !== '') {
      const parsed = Number(ratingRawStr);
      if (Number.isNaN(parsed)) {
        errors.push({ row: dataRow, message: `rating "${ratingRawStr}" is not a number` });
        continue;
      }
      ratingRaw = parsed;
      ratingNorm = scale ? normalizeRating(parsed, scale) : null;
    }

    const record: FeedbackRecord = {
      recordId: `${ctx.sourceId}:${dataRow}`,
      accountId: ctx.accountId,
      brandId: brandId ?? '',
      sourceId: ctx.sourceId,
      sourceType: 'import_csv',
      capturedAt: at(idx.capturedAt) ?? '',
      isComplete: true,
      flags: [],
      ...(ratingRaw !== undefined ? { ratingRaw } : {}),
      ...(scale !== undefined ? { ratingScale: scale } : {}),
      ...(ratingNorm !== undefined ? { ratingNorm } : {}),
      ...(idx.brandLove >= 0 ? { brandLove: normalizeLoveLabel(at(idx.brandLove)) } : {}),
      ...(idx.comment >= 0 ? { commentText: at(idx.comment) } : {}),
      ...(idx.segment >= 0 ? { segment: at(idx.segment) } : {}),
      provenance: `import_batch:${ctx.sourceId}`,
    };

    const problems = validateFeedbackRecord(record);
    if (problems.length > 0) {
      errors.push({ row: dataRow, message: problems.map((p) => p.message).join('; ') });
      continue;
    }
    records.push(record);
  }

  return { records, errors };
}
