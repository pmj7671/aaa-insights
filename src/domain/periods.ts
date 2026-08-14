/**
 * Reporting periods — timestamps are stored UTC (E-22); period boundaries are
 * computed in the account's configured timezone so "today"/"prior period" line
 * up with the operator's calendar, then converted back to UTC for querying.
 * Requirements: E-22, NFR-9 (timestamps stored UTC).
 */
export interface PeriodBounds {
  /** Inclusive UTC start (ISO-8601). */
  startUtc: string;
  /** Inclusive UTC end (ISO-8601), one ms before the next period. */
  endUtc: string;
}

const DAY_MS = 86_400_000;

/**
 * The UTC bounds of the calendar day containing `instantIso`, as seen in a
 * timezone `offsetMinutes` from UTC (e.g. UTC−7 → -420). Local midnight is found
 * in the shifted frame, then converted back to UTC.
 */
export function dayBoundsUtc(instantIso: string, offsetMinutes: number): PeriodBounds {
  const ms = Date.parse(instantIso);
  if (Number.isNaN(ms)) throw new Error(`invalid instant: ${instantIso}`);
  const offsetMs = offsetMinutes * 60_000;
  const localMs = ms + offsetMs;
  const localMidnight = Math.floor(localMs / DAY_MS) * DAY_MS;
  const startUtcMs = localMidnight - offsetMs;
  const endUtcMs = startUtcMs + DAY_MS - 1;
  return { startUtc: new Date(startUtcMs).toISOString(), endUtc: new Date(endUtcMs).toISOString() };
}

/** The UTC bounds of the day before the one containing `instantIso` (the "prior period"). */
export function priorDayBoundsUtc(instantIso: string, offsetMinutes: number): PeriodBounds {
  const current = dayBoundsUtc(instantIso, offsetMinutes);
  const priorInstant = new Date(Date.parse(current.startUtc) - 1).toISOString();
  return dayBoundsUtc(priorInstant, offsetMinutes);
}
