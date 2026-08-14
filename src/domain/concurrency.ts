/**
 * Optimistic concurrency — two admins editing the same survey must not silently
 * overwrite each other.
 * Requirements: E-11. Each editable entity carries a version; an edit must state
 * the version it was based on, and is rejected as a conflict if that's stale.
 */
export interface Versioned {
  version: number;
}

export type EditResult<T> =
  | { ok: true; next: T }
  | { ok: false; conflict: true; currentVersion: number };

/**
 * Apply an edit only if `expectedVersion` matches the entity's current version;
 * otherwise return a conflict (no silent overwrite — E-11). On success the
 * version is bumped so the next stale edit will conflict.
 */
export function applyEdit<T extends Versioned>(
  current: T,
  expectedVersion: number,
  mutate: (entity: T) => T,
): EditResult<T> {
  if (current.version !== expectedVersion) {
    return { ok: false, conflict: true, currentVersion: current.version };
  }
  const mutated = mutate(current);
  return { ok: true, next: { ...mutated, version: current.version + 1 } };
}
