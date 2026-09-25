import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('laos_token');
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch {
          localStorage.removeItem('laos_token');
          setUser(null);
        }
      } else {
        // Auto demo user for seamless initial onboarding
        setUser({
          user_id: '00000000-0000-0000-0000-000000000001',
          email: 'seif@example.com',
          full_name: 'Seif Kassab',
          locale: 'en',
          created_at: new Date().toISOString()
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      localStorage.setItem('laos_token', res.access_token);
      const profile = await api.getProfile();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.login('seif@example.com');
      localStorage.setItem('laos_token', res.access_token);
      setUser({
        user_id: res.user_id,
        email: 'seif@example.com',
        full_name: res.full_name || 'Seif Kassab',
        locale: 'en',
        created_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('laos_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
