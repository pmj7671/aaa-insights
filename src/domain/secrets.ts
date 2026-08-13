/**
 * Secrets — credentials referenced by name, resolved only at the point of use,
 * never held in the data model, exports, or logs.
 * Requirements: R-43 (secrets vault), DPS-11, INV-8.
 *
 * A SecretRef is opaque: it carries only a name, so serialising a record that
 * references a secret can never leak the value. The value lives behind the
 * SecretVault seam (Google Secret Manager in production).
 */
export interface SecretRef {
  readonly kind: 'secret_ref';
  readonly name: string;
}

export function secretRef(name: string): SecretRef {
  return { kind: 'secret_ref', name };
}

export function isSecretRef(value: unknown): value is SecretRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'secret_ref' &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

/** The seam: the vault resolves a ref to its value, only when needed (never stored). */
export interface SecretVault {
  resolve(ref: SecretRef): string | undefined;
}

/**
 * Defense-in-depth: strip any known secret value from a string bound for a log or
 * export, so a value that somehow reached a message is scrubbed (R-43, INV-8).
 */
export function redactSecrets(text: string, secretValues: readonly string[]): string {
  let out = text;
  for (const value of secretValues) {
    if (value) out = out.split(value).join('[REDACTED:SECRET]');
  }
  return out;
}
