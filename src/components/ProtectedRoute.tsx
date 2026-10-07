import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { canAccess } from '../auth/authorization';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles: readonly Role[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (!canAccess(session.user.role, allowedRoles)) {
    return <Navigate to="/sin-acceso" replace />;
  }
  return children;
}
