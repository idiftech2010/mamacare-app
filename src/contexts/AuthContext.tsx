import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, loginWithGoogle as firebaseGoogleLogin } from '../firebase'; 
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  getToken: () => string | null;
  updateProfile: (data: any) => Promise<boolean>;
  register: (email: string, pass: string, name: string, phone?: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuthState = (authToken: string, userData: any) => {
    localStorage.setItem('mamacare_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const clearAuthState = async () => {
    localStorage.removeItem('mamacare_token');
    setToken(null);
    setUser(null);
    try { await signOut(auth); } catch { }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('mamacare_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setToken(storedToken);
          setUser(userData);
        } else {
          localStorage.removeItem('mamacare_token');
        }
      } catch (error) {
        localStorage.removeItem('mamacare_token');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const getToken = useCallback(() => token, [token]);

  const updateProfile = async (data: any) => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) return false;
      const updatedUser = await response.json();
      setUser(updatedUser);
      return true;
    } catch (e) { return false; }
  };

  const register = async (email: string, pass: string, name: string, phone?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name, phone, authProvider: 'email' }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Registration failed');
    }
    const data = await response.json();
    saveAuthState(data.token, data.user);
    return true;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, authProvider: 'email' }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Login failed');
    }
    const data = await response.json();
    saveAuthState(data.token, data.user);
    return true;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await firebaseGoogleLogin();
      // FIX: Added (as any) to stop the TS2339 build error
      const googleUser = (result as any)?.user || result;

      if (!googleUser) throw new Error("No user data");

      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: googleUser.email, 
          name: googleUser.displayName || googleUser.name, 
          googleId: googleUser.uid || googleUser.id
        }),
      });

      if (!response.ok) throw new Error('Google login failed');
      const data = await response.json();
      saveAuthState(data.token, data.user);
      return data.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    await clearAuthState();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      isSuperadmin: user?.role === 'superadmin',
      isLoading,
      logout,
      getToken,
      updateProfile,
      register,
      login,
      loginWithGoogle
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};