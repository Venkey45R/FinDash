import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fin-dash-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('fin-dash-token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const { token, user: userData } = await authApi.login(credentials);
    localStorage.setItem('fin-dash-token', token);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const { token, user: userData } = await authApi.signup(data);
    localStorage.setItem('fin-dash-token', token);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (credential) => {
    const { token, user: userData, isNewUser } = await authApi.googleAuth(credential);
    localStorage.setItem('fin-dash-token', token);
    setUser(userData);
    return { user: userData, isNewUser };
  };

  const completeOnboarding = async () => {
    const userData = await authApi.completeOnboarding();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('fin-dash-token');
    // We should clear the FinanceContext state too, which usually relies on a reload
    // or an event. For now, reload the page to clear all states.
    setUser(null);
    window.location.href = '/'; 
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOnboarded: user?.isOnboarded || false,
    login,
    signup,
    googleLogin,
    completeOnboarding,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] dark:bg-[#0f172a]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
