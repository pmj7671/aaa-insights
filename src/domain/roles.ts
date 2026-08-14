/**
 * Account roles & permissions.
 * Requirements: R-21 (at least two roles — Owner/Admin and Member — plus a
 * lightweight case-owner designation for RecoveryCase assignment). Authorization
 * enforces this model (R-42).
 */
export type Role = 'owner_admin' | 'member' | 'case_owner';

export type Action =
  | 'manage_account'
  | 'manage_users'
  | 'manage_billing'
  | 'build_survey'
  | 'view_analysis'
  | 'export_data'
  | 'own_case'
  | 'resolve_case';

const MATRIX: Record<Role, readonly Action[]> = {
  owner_admin: [
    'manage_account',
    'manage_users',
    'manage_billing',
    'build_survey',
    'view_analysis',
    'export_data',
    'own_case',
    'resolve_case',
  ],
  member: ['build_survey', 'view_analysis', 'export_data'],
  // A lightweight designation layered on a user, for RecoveryCase assignment.
  case_owner: ['view_analysis', 'own_case', 'resolve_case'],
};

/** Whether a single role grants an action. */
export function can(role: Role, action: Action): boolean {
  return MATRIX[role].includes(action);
}

/** Whether any of a user's roles grants an action (roles compose — R-21). */
export function canAny(roles: readonly Role[], action: Action): boolean {
  return roles.some((r) => can(r, action));
}
