import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { clearStoredAuthSession, saveStoredAuthSession } from '../../../services/auth/authSessionStorage';
import { SignInResponse } from '../../../services/auth/types';
import { useAppStore } from '../../../state/useAppStore';

type AuthContextValue = {
  authSession?: SignInResponse;
  isAuthenticated: boolean;
  setAuthSession: (session: SignInResponse) => Promise<void>;
  clearAuthSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const authToken = useAppStore(state => state.authToken);
  const authUser = useAppStore(state => state.authUser);
  const authCommunity = useAppStore(state => state.authCommunity);
  const setStoreAuthSession = useAppStore(state => state.setAuthSession);
  const clearStoreAuthSession = useAppStore(state => state.clearAuthSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      authSession: authToken && authUser ? { token: authToken, user: authUser, community: authCommunity } : undefined,
      isAuthenticated: Boolean(authToken),
      setAuthSession: async session => {
        await saveStoredAuthSession(session);
        setStoreAuthSession(session);
      },
      clearAuthSession: async () => {
        await clearStoredAuthSession();
        clearStoreAuthSession();
      },
    }),
    [authCommunity, authToken, authUser, clearStoreAuthSession, setStoreAuthSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
