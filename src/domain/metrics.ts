/**
 * Metric primitives with the counting invariants baked in.
 * Requirements: INV-2 (counts never negative, never exceed the total, each
 * response counted once per dimension).
 */
import { invariant } from './assert.js';

/**
 * Share of `count` within `total`, as a percentage rounded to 1 decimal.
 * Enforces INV-2: count and total are non-negative and count never exceeds
 * total. A zero total yields 0 (no division-by-zero, no fabricated share).
 */
export function share(count: number, total: number): number {
  invariant(Number.isInteger(count) && count >= 0, `count must be a non-negative integer: ${count}`);
  invariant(Number.isInteger(total) && total >= 0, `total must be a non-negative integer: ${total}`);
  invariant(count <= total, `count (${count}) cannot exceed total (${total}) — INV-2`);
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

/**
 * Count occurrences of each category, each item counted exactly once (INV-2).
 * Returns a map keyed by category with the total alongside.
 */
export function countByCategory<T extends string>(
  items: readonly T[],
): { counts: Record<T, number>; total: number } {
  const counts = {} as Record<T, number>;
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  const total = items.length;
  const summed = (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
  invariant(summed === total, 'category counts must sum to the total (INV-2)');
  return { counts, total };
}
