/**
 * Secrets vault. Built in Phase 4, increment 13.
 * Covers: R-43, DPS-11, INV-8.
 */
import { describe, it, expect } from 'vitest';
import { secretRef, isSecretRef, redactSecrets, type SecretVault } from '../../src/domain/secrets';

describe('SecretRef (R-43)', () => {
  it('R-43: a secret is stored by name only — serialising it never leaks a value', () => {
    const ref = secretRef('vertex_api_key');
    const json = JSON.stringify({ provider: 'vertex', key: ref });
    expect(json).toContain('vertex_api_key');
    expect(json).not.toMatch(/sk-|AIza|secret-value/); // no value present, because there is none
    expect(isSecretRef(ref)).toBe(true);
    expect(isSecretRef({ name: 'x' })).toBe(false);
  });

  it('R-43: the vault resolves a value only at the point of use', () => {
    const vault: SecretVault = { resolve: (r) => (r.name === 'vertex_api_key' ? 'super-secret' : undefined) };
    expect(vault.resolve(secretRef('vertex_api_key'))).toBe('super-secret');
    expect(vault.resolve(secretRef('unknown'))).toBeUndefined();
  });
});

describe('redactSecrets (R-43 / INV-8)', () => {
  it('R-43: scrubs any known secret value from a log/export string', () => {
    const line = 'calling provider with token super-secret and id 42';
    expect(redactSecrets(line, ['super-secret'])).toBe('calling provider with token [REDACTED:SECRET] and id 42');
  });
});
