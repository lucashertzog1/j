
'use client';

import { createContext, useContext, ReactNode } from 'react';

// This is a placeholder context. It no longer provides any user or auth state.
// It's kept to prevent import errors in other files, but can be removed if all imports are updated.

type AuthContextType = {
  user: null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = { user: null, isLoading: false };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

    