/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gt_token') || '');
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('gt_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('gt_token', token);
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('gt_token');
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gt_user');
    }
  }, [user]);

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || '');
    setUser(nextUser || null);
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser((previousUser) => ({
      ...(previousUser || {}),
      ...(nextUser || {}),
    }));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token),
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
