import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api.js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  totpEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('souq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('souq_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiFetch('/auth/me')
        .then((data) => {
          if (data && data.email) {
            setUser(data);
            localStorage.setItem('souq_user', JSON.stringify(data));
          }
        })
        .catch((err: any) => {
          // Only clear session on verified unauthorized 401 token invalidation
          const errMsg = err?.message || '';
          if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('token')) {
            logout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    localStorage.setItem('souq_token', data.accessToken);
    if (data.user) {
      localStorage.setItem('souq_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    setToken(data.accessToken);
  };

  const register = async (name: string, email: string, pass: string, role: string = 'buyer') => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, role }),
    });
    localStorage.setItem('souq_token', data.accessToken);
    if (data.user) {
      localStorage.setItem('souq_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    setToken(data.accessToken);
  };

  const logout = () => {
    localStorage.removeItem('souq_token');
    localStorage.removeItem('souq_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
