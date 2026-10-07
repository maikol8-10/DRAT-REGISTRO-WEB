import { useMemo, useState, type ReactNode } from 'react';

import type { AuthSession } from '../types/auth';
import { AuthContext } from './AuthContext';
import { clearSession, loadSession, saveSession } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const value = useMemo(
    () => ({
      session,
      setAuthenticatedSession(nextSession: AuthSession) {
        saveSession(nextSession);
        setSession(nextSession);
      },
      logout() {
        clearSession();
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
