/**
 * Runtime invariant guard. Grounded AI™ IMPLEMENT: the spec's invariants are
 * enforced in code, not just in tests — a violation throws rather than
 * silently producing a wrong number.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violated: ${message}`);
  }
}
