import { createContext, useContext } from 'react';

import type { AuthSession } from '../types/auth';

export interface AuthContextValue {
  session: AuthSession | null;
  setAuthenticatedSession: (session: AuthSession) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
}
