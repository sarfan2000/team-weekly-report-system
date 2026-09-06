import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from './types';
import { api } from './api';

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const res = await api.getMe();
          if (res?.data && mounted) {
            const u = res.data;
            const mappedRole = (u.role === 'MANAGER' || u.role === 'manager') ? 'manager' : 'team_member';
            setCurrentUser({ ...u, id: u.id || u._id, role: mappedRole });
          }
        }
      } catch (error) {
        console.error('Failed to auth via token:', error);
        localStorage.removeItem('auth_token');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res?.data?.user) {
        const u = res.data.user;
        const mappedRole = (u.role === 'MANAGER' || u.role === 'manager') ? 'manager' : 'team_member';
        setCurrentUser({ ...u, id: u.id || u._id, role: mappedRole } as User);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    api.logout();
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, isManager: currentUser?.role === 'manager' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
