/**
 * Postgres ContactRepository — production storage adapter. Same port as the in-memory
 * repo (see the shared contract test). Tenant isolation (INV-6) via an account_id
 * filter on every statement.
 */
import type { Pool } from 'pg';
import type { Contact } from '../domain/contact.js';
import type { ContactRepository } from './ports.js';

function rowToContact(r: Record<string, unknown>): Contact {
  const c: Contact = {
    contactId: r.contact_id as string,
    respondentRef: r.respondent_ref as string,
    channel: r.channel as Contact['channel'],
    value: r.value as string,
    consentScope: r.consent_scope as string,
    consentAt: (r.consent_at as Date).toISOString(),
    origin: 'first_party',
  };
  if (r.withdrawn_at != null) c.withdrawnAt = (r.withdrawn_at as Date).toISOString();
  return c;
}

export class PgContactRepository implements ContactRepository {
  constructor(private readonly pool: Pool) {}

  async save(accountId: string, c: Contact): Promise<void> {
    await this.pool.query(
      `INSERT INTO contacts
         (account_id, contact_id, respondent_ref, channel, value, consent_scope, consent_at, withdrawn_at, origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (account_id, contact_id) DO UPDATE SET
          respondent_ref=EXCLUDED.respondent_ref, channel=EXCLUDED.channel,
          value=EXCLUDED.value, consent_scope=EXCLUDED.consent_scope,
          consent_at=EXCLUDED.consent_at, withdrawn_at=EXCLUDED.withdrawn_at,
          origin=EXCLUDED.origin`,
      [accountId, c.contactId, c.respondentRef, c.channel, c.value, c.consentScope, c.consentAt, c.withdrawnAt ?? null, c.origin],
    );
  }

  async get(accountId: string, contactId: string): Promise<Contact | null> {
    const res = await this.pool.query('SELECT * FROM contacts WHERE account_id=$1 AND contact_id=$2', [accountId, contactId]);
    return res.rows[0] ? rowToContact(res.rows[0]) : null;
  }

  async list(accountId: string): Promise<Contact[]> {
    const res = await this.pool.query('SELECT * FROM contacts WHERE account_id=$1 ORDER BY contact_id', [accountId]);
    return res.rows.map(rowToContact);
  }

  async delete(accountId: string, contactId: string): Promise<void> {
    await this.pool.query('DELETE FROM contacts WHERE account_id=$1 AND contact_id=$2', [accountId, contactId]);
  }
}
