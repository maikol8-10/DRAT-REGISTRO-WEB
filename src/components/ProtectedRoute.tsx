import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { canAccess } from '../auth/authorization';
import { currentUser } from '../auth/session';
import type { Role } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles: readonly Role[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  if (!canAccess(currentUser.role, allowedRoles)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return children;
}
