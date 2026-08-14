/**
 * Account data lifecycle — export and deletion of everything an account owns.
 *
 * Requirements:
 *  - R-23:  delete a survey/campaign/response, and export or delete ALL account data.
 *  - INV-7: a deletion removes the data from all future analysis, and deleted data
 *           never reappears — enforced here with a tombstone ledger — subject to the
 *           DPS-5 open-case retention hold.
 *  - DPS-3: data-subject erasure works by provenance, for our own respondents and for
 *           ingested third-party public-review authors alike.
 *  - DPS-5: on a full-account purge, open RecoveryCases and the baseline records their
 *           recovery_delta depends on are HELD past deletion until the case closes.
 *
 * These are pure functions over an in-memory account bundle; the persistence layer
 * applies the same removals to storage so deletions "propagate everywhere" (INV-7).
 */
import type { FeedbackRecord } from './feedbackRecord.js';
import type { RecoveryCase } from './recovery.js';
import type { Contact } from './contact.js';
import type { Competitor } from './competitors.js';

/** Everything an account owns, in one bundle. */
export interface AccountData {
  accountId: string;
  records: FeedbackRecord[];
  cases: RecoveryCase[];
  contacts: Contact[];
  competitors: Competitor[];
  /** Record ids that have been deleted — deleted data never reappears (INV-7). */
  tombstones: string[];
}

/** A portable, provenance-preserving snapshot of all account data (R-23, DPS-3). */
export interface AccountExport {
  accountId: string;
  exportedAt: string; // ISO-8601 UTC
  records: FeedbackRecord[];
  recoveryCases: RecoveryCase[];
  contacts: Contact[];
  competitors: Competitor[];
  counts: { records: number; cases: number; contacts: number; competitors: number };
}

/** The outcome of a full-account purge, naming what was held under the DPS-5 hold. */
export interface PurgeResult {
  retained: AccountData;
  purgedRecordIds: string[];
  /** Open cases held past deletion until they close (DPS-5). */
  heldCaseIds: string[];
}

export function emptyAccount(accountId: string): AccountData {
  return { accountId, records: [], cases: [], contacts: [], competitors: [], tombstones: [] };
}

/**
 * Add a response. A tombstoned id is refused unchanged — deleted data never
 * reappears, even via re-import (INV-7).
 */
export function addRecord(data: AccountData, record: FeedbackRecord): AccountData {
  if (data.tombstones.includes(record.recordId)) return data;
  if (data.records.some((r) => r.recordId === record.recordId)) return data;
  return { ...data, records: [...data.records, record] };
}

/**
 * Delete one response. Removes it, tombstones the id, and unlinks it from any
 * RecoveryCase; a case left with no evidence is dropped (INV-7 propagation).
 */
export function deleteResponse(data: AccountData, recordId: string): AccountData {
  if (!data.records.some((r) => r.recordId === recordId)) {
    // still tombstone it so a later re-import can't resurrect it (INV-7)
    return data.tombstones.includes(recordId)
      ? data
      : { ...data, tombstones: [...data.tombstones, recordId] };
  }
  const records = data.records.filter((r) => r.recordId !== recordId);
  const cases = data.cases
    .map((c) => (c.recordIds.includes(recordId) ? { ...c, recordIds: c.recordIds.filter((id) => id !== recordId) } : c))
    .filter((c) => c.recordIds.length > 0);
  const tombstones = data.tombstones.includes(recordId) ? data.tombstones : [...data.tombstones, recordId];
  return { ...data, records, cases, tombstones };
}

/** Delete every response from one source (a survey or campaign) — R-23. */
export function deleteBySource(data: AccountData, sourceId: string): AccountData {
  const ids = data.records.filter((r) => r.sourceId === sourceId).map((r) => r.recordId);
  return ids.reduce((d, id) => deleteResponse(d, id), data);
}

/**
 * Data-subject erasure by provenance (DPS-3) — works for a first-party respondent
 * and for an ingested third-party review author identically.
 */
export function eraseByProvenance(data: AccountData, provenance: string): AccountData {
  const ids = data.records.filter((r) => r.provenance === provenance).map((r) => r.recordId);
  return ids.reduce((d, id) => deleteResponse(d, id), data);
}

/** Export ALL account data as a portable snapshot (R-23); provenance is retained (DPS-3). */
export function exportAccountData(data: AccountData, exportedAt: string): AccountExport {
  return {
    accountId: data.accountId,
    exportedAt,
    records: [...data.records],
    recoveryCases: [...data.cases],
    contacts: [...data.contacts],
    competitors: [...data.competitors],
    counts: {
      records: data.records.length,
      cases: data.cases.length,
      contacts: data.contacts.length,
      competitors: data.competitors.length,
    },
  };
}

/**
 * Delete ALL account data (R-23). Everything is purged EXCEPT open RecoveryCases
 * and the baseline records their recovery_delta depends on, which are held past
 * deletion until each case closes (DPS-5). Purged ids are tombstoned (INV-7).
 */
export function deleteAllAccountData(data: AccountData): PurgeResult {
  const openCases = data.cases.filter((c) => c.status !== 'closed');
  const heldRecordIds = new Set(openCases.flatMap((c) => c.recordIds));
  const retainedRecords = data.records.filter((r) => heldRecordIds.has(r.recordId));
  const purgedRecordIds = data.records.filter((r) => !heldRecordIds.has(r.recordId)).map((r) => r.recordId);
  const retained: AccountData = {
    accountId: data.accountId,
    records: retainedRecords,
    cases: openCases, // closed cases purged; open ones held (DPS-5)
    contacts: [], // first-party contacts purged
    competitors: [], // competitor config purged
    tombstones: [...data.tombstones, ...purgedRecordIds],
  };
  return { retained, purgedRecordIds, heldCaseIds: openCases.map((c) => c.id) };
}
