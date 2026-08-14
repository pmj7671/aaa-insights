/**
 * CSV export — serialise any analysis view / raw data to CSV.
 * Requirements: R-22 (export any analysis view and the insight report; CSV for
 * raw data). PDF/slides are a rendering-layer concern, out of this module.
 */

/** Quote a cell if it contains a comma, quote, or newline; escape embedded quotes (RFC-4180). */
export function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Serialise rows to CSV. Columns default to the keys of the first row; pass an
 * explicit column list to fix order or subset. Always emits a header row.
 */
export function toCsv(rows: readonly Record<string, unknown>[], columns?: readonly string[]): string {
  const cols = columns ?? (rows.length > 0 ? Object.keys(rows[0]!) : []);
  const header = cols.map(csvCell).join(',');
  if (rows.length === 0) return header;
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}
