/**
 * Traceability — the spine that makes every AI claim openable back to the exact
 * responses behind it.
 * Requirements: INV-3 (every theme, aggregate, Brand Love read, Trust read,
 * insight, recommendation, and query answer is traceable to its underlying
 * responses) and R-16 (open the exact underlying responses for any read).
 *
 * Generic and additive: any labeled read (a Love label, a Trust bucket, a
 * sentiment polarity, a theme id) can be indexed to the records that produced it,
 * and a client can then "open" a given key to see those records.
 */
import { invariant } from './assert.js';

export type RecordId = string;

/** Anything that presents an aggregate claim must carry the records behind it. */
export interface Traceable {
  recordIds: RecordId[];
}

/** A map from a read's key (label / bucket / theme) to the records behind it. */
export type TraceIndex<K> = Map<K, RecordId[]>;

/**
 * Build a trace index from any labeled items: group each item's recordId under
 * its key, de-duplicating records within a key (INV-2 — a record is counted once
 * per key). Insertion order of first appearance is preserved.
 */
export function buildTraceIndex<T, K>(
  items: readonly T[],
  keyOf: (item: T) => K,
  recordIdOf: (item: T) => RecordId,
): TraceIndex<K> {
  const index: TraceIndex<K> = new Map();
  const seen = new Map<K, Set<RecordId>>();
  for (const item of items) {
    const key = keyOf(item);
    const rid = recordIdOf(item);
    invariant(rid !== '', 'a traceable item must carry a non-empty recordId (INV-3)');
    let set = seen.get(key);
    if (!set) {
      set = new Set();
      seen.set(key, set);
      index.set(key, []);
    }
    if (!set.has(rid)) {
      set.add(rid);
      index.get(key)!.push(rid);
    }
  }
  return index;
}

/**
 * Open a key to the exact underlying responses (R-16). Returns a copy of the
 * record ids, or an empty array when the key has none — never throws.
 */
export function openTrace<K>(index: TraceIndex<K>, key: K): RecordId[] {
  const ids = index.get(key);
  return ids ? [...ids] : [];
}

/** Whether an aggregate is traceable — carries at least one underlying record (INV-3). */
export function isTraceable(claim: Traceable): boolean {
  return Array.isArray(claim.recordIds) && claim.recordIds.length > 0;
}

/** Assert an aggregate is traceable; throws if a claim has no path to its data. */
export function assertTraceable(claim: Traceable, what = 'claim'): void {
  invariant(isTraceable(claim), `${what} must be traceable to its underlying responses (INV-3)`);
}
