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
          if (data) {
            const userObj: User = data.user || {
              id: data.id || data._id,
              name: data.name || data.displayName || data.username || 'User',
              email: data.email,
              role: data.role || 'buyer',
              totpEnabled: Boolean(data.totpEnabled),
            };
            if (userObj.email || userObj.name) {
              setUser(userObj);
              localStorage.setItem('souq_user', JSON.stringify(userObj));
            }
          }
        })
        .catch((err: any) => {
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

    const accessToken = data.accessToken || data.token;
    const userObj: User = data.user || {
      id: data._id || data.id,
      name: data.name || data.displayName || data.username || email.split('@')[0],
      email: data.email || email,
      role: data.role || 'buyer',
      totpEnabled: Boolean(data.totpEnabled),
    };

    if (accessToken) {
      localStorage.setItem('souq_token', accessToken);
      setToken(accessToken);
    }
    if (userObj) {
      localStorage.setItem('souq_user', JSON.stringify(userObj));
      setUser(userObj);
    }
  };

  const register = async (name: string, email: string, pass: string, role: string = 'buyer') => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, role }),
    });

    const accessToken = data.accessToken || data.token;
    const userObj: User = data.user || {
      id: data._id || data.id,
      name: data.name || data.displayName || name,
      email: data.email || email,
      role: data.role || (role as any),
      totpEnabled: Boolean(data.totpEnabled),
    };

    if (accessToken) {
      localStorage.setItem('souq_token', accessToken);
      setToken(accessToken);
    }
    if (userObj) {
      localStorage.setItem('souq_user', JSON.stringify(userObj));
      setUser(userObj);
    }
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
