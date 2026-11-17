import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    authApi.me().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback((res) => {
    localStorage.setItem('token', res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const login = useCallback((data) => authApi.login(data).then(handleAuth), [handleAuth]);
  const register = useCallback((data) => authApi.register(data).then(handleAuth), [handleAuth]);
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = {
    user, loading, login, register, logout,
    isAdmin: user?.role === 'ADMIN',
    canCreateProject: user?.role === 'ADMIN' || user?.role === 'MANAGER',
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
