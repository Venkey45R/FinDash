import React, { createContext, useContext } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

/**
 * Single-user mode: AuthProvider is a no-op shell.
 * No login/logout/token management needed.
 */
export const AuthProvider = ({ children }) => {
  const value = {
    user: null,
    loading: false,
    isAuthenticated: true,
    isOnboarded: true,
    login: async () => {},
    signup: async () => {},
    googleLogin: async () => {},
    completeOnboarding: async () => {},
    logout: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
