/**
 * Roles & permissions. Built in Phase 4, increment 15.
 * Covers: R-21.
 */
import { describe, it, expect } from 'vitest';
import { can, canAny } from '../../src/domain/roles';

describe('roles (R-21)', () => {
  it('R-21: Owner/Admin can manage users; Member cannot', () => {
    expect(can('owner_admin', 'manage_users')).toBe(true);
    expect(can('member', 'manage_users')).toBe(false);
  });

  it('R-21: Member can build surveys and view analysis', () => {
    expect(can('member', 'build_survey')).toBe(true);
    expect(can('member', 'view_analysis')).toBe(true);
  });

  it('R-21: the case-owner designation can own and resolve cases', () => {
    expect(can('case_owner', 'resolve_case')).toBe(true);
    expect(can('member', 'resolve_case')).toBe(false);
  });

  it('R-21: roles compose — a member who is also a case-owner can resolve cases', () => {
    expect(canAny(['member', 'case_owner'], 'resolve_case')).toBe(true);
    expect(canAny(['member'], 'manage_billing')).toBe(false);
  });
});
