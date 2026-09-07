import type { Role } from '../types/auth';

export function canAccess(userRole: Role, allowedRoles: readonly Role[]) {
  return allowedRoles.includes(userRole);
}
