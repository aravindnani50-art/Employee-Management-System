import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout } from './authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from storage on mount
  useEffect(() => {
    const activeUser = getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = true) => {
    const loggedInUser = await authLogin(email, password, rememberMe);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
