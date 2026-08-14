/**
 * In-memory ContactRepository — a real implementation of the storage port for tests
 * and offline use. Enforces tenant isolation (INV-6) with the same semantics the
 * Postgres adapter must match (see the shared contract test).
 */
import type { Contact } from '../domain/contact.js';
import type { ContactRepository } from './ports.js';

const key = (accountId: string, contactId: string) => JSON.stringify([accountId, contactId]);

export class MemoryContactRepository implements ContactRepository {
  private readonly contacts = new Map<string, Contact>();

  async save(accountId: string, contact: Contact): Promise<void> {
    this.contacts.set(key(accountId, contact.contactId), { ...contact });
  }

  async get(accountId: string, contactId: string): Promise<Contact | null> {
    const c = this.contacts.get(key(accountId, contactId)); // INV-6: scoped by account
    return c ? { ...c } : null;
  }

  async list(accountId: string): Promise<Contact[]> {
    const out: Contact[] = [];
    for (const [k, c] of this.contacts) {
      if ((JSON.parse(k) as [string, string])[0] === accountId) out.push({ ...c });
    }
    return out.sort((a, b) => a.contactId.localeCompare(b.contactId));
  }

  async delete(accountId: string, contactId: string): Promise<void> {
    this.contacts.delete(key(accountId, contactId));
  }
}
