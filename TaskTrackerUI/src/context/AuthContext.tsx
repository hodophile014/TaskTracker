import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi, clearStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      const u = await authApi.getMe();
      setUser(u);
      setToken(currentToken);
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setToken(res.token);
    await refreshUser();
  };

  const register = async (payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => {
    const res = await authApi.register(payload);
    setToken(res.token);
    await refreshUser();
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isManager,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

