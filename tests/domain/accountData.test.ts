/**
 * Account data export & deletion. Built in Phase 4, increment 18.
 * Covers: R-23, INV-7, DPS-3, and the DPS-5 open-case retention hold.
 */
import { describe, it, expect } from 'vitest';
import {
  emptyAccount,
  addRecord,
  deleteResponse,
  deleteBySource,
  eraseByProvenance,
  exportAccountData,
  deleteAllAccountData,
  type AccountData,
} from '../../src/domain/accountData';
import type { FeedbackRecord } from '../../src/domain/feedbackRecord';
import type { RecoveryCase } from '../../src/domain/recovery';
import type { Contact } from '../../src/domain/contact';
import type { Competitor } from '../../src/domain/competitors';

const rec = (over: Partial<FeedbackRecord> = {}): FeedbackRecord => ({
  recordId: 'r1',
  accountId: 'a1',
  brandId: 'b1',
  sourceId: 's1',
  sourceType: 'survey',
  capturedAt: '2026-08-01T00:00:00Z',
  isComplete: true,
  flags: [],
  ...over,
});

const contact = (over: Partial<Contact> = {}): Contact => ({
  contactId: 'k1',
  respondentRef: 'r1',
  channel: 'email',
  value: 'x@example.com',
  consentScope: 'service_recovery',
  consentAt: '2026-08-01T00:00:00Z',
  origin: 'first_party',
  ...(over as object),
});

const rival: Competitor = { brandId: 'c1', name: 'Rival', aliases: [], tracked: true };

const openCase = (over: Partial<RecoveryCase> = {}): RecoveryCase => ({
  id: 'case1',
  recordIds: ['r1'],
  kind: 'contactable',
  status: 'open',
  groupingKey: 'g1',
  openedAt: '2026-08-01T00:00:00Z',
  ...over,
});

function seeded(): AccountData {
  let d = emptyAccount('a1');
  d = addRecord(d, rec({ recordId: 'r1', sourceId: 's1', provenance: 'yelp:author-42' }));
  d = addRecord(d, rec({ recordId: 'r2', sourceId: 's1', provenance: 'survey:resp-1' }));
  d = addRecord(d, rec({ recordId: 'r3', sourceId: 's2', provenance: 'yelp:author-42' }));
  return { ...d, contacts: [contact()], competitors: [rival] };
}

describe('account data export & deletion (R-23 / INV-7 / DPS-3 / DPS-5)', () => {
  it('R-23: exports all account data with provenance and counts', () => {
    const dump = exportAccountData(seeded(), '2026-08-14T00:00:00Z');
    expect(dump.counts).toEqual({ records: 3, cases: 0, contacts: 1, competitors: 1 });
    expect(dump.records.map((r) => r.provenance)).toContain('yelp:author-42');
    expect(dump.exportedAt).toBe('2026-08-14T00:00:00Z');
  });

  it('R-23: deletes a single response and drops it from analysis', () => {
    const d = deleteResponse(seeded(), 'r2');
    expect(d.records.map((r) => r.recordId).sort()).toEqual(['r1', 'r3']);
  });

  it('R-23: deletes an entire source (survey/campaign)', () => {
    const d = deleteBySource(seeded(), 's1');
    expect(d.records.map((r) => r.recordId)).toEqual(['r3']);
  });

  it('INV-7: deleted data never reappears, even via re-import', () => {
    const d = deleteResponse(seeded(), 'r2');
    const readded = addRecord(d, rec({ recordId: 'r2', sourceId: 's1' }));
    expect(readded.records.some((r) => r.recordId === 'r2')).toBe(false);
    expect(readded.tombstones).toContain('r2');
  });

  it('INV-7: deleting a response unlinks it from a case; an emptied case is dropped', () => {
    const base = { ...seeded(), cases: [openCase({ recordIds: ['r1'] })] };
    const d = deleteResponse(base, 'r1');
    expect(d.cases).toHaveLength(0);
  });

  it('DPS-3: erasure by provenance removes both first- and third-party items', () => {
    const d = eraseByProvenance(seeded(), 'yelp:author-42');
    expect(d.records.map((r) => r.recordId)).toEqual(['r2']);
    expect(d.tombstones.sort()).toEqual(['r1', 'r3']);
  });

  it('DPS-5: a full purge holds open cases and their baseline records, purges the rest', () => {
    const base = { ...seeded(), cases: [openCase({ id: 'case1', recordIds: ['r1'] }), openCase({ id: 'case2', status: 'closed', recordIds: ['r2'] })] };
    const { retained, purgedRecordIds, heldCaseIds } = deleteAllAccountData(base);
    expect(heldCaseIds).toEqual(['case1']); // only the open case is held
    expect(retained.records.map((r) => r.recordId)).toEqual(['r1']); // its baseline held
    expect(retained.contacts).toHaveLength(0);
    expect(retained.competitors).toHaveLength(0);
    expect(purgedRecordIds.sort()).toEqual(['r2', 'r3']);
    expect(retained.tombstones.sort()).toEqual(['r2', 'r3']);
  });
});
