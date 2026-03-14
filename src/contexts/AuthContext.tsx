import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mamacare-backend-n1z7.onrender.com/api';;

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  authProvider: 'email' | 'google' | 'phone';
  profile?: {
    age?: number;
    dueDate?: string;
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
  };
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithPhone: (phone: string, otp?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<boolean>;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage and validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mamacare-token');
      const savedUser = localStorage.getItem('mamacare-user');
      
      if (token && savedUser) {
        try {
          // Validate token with backend
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('mamacare-user', JSON.stringify(userData));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('mamacare-token');
            localStorage.removeItem('mamacare-user');
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          // Don't clear storage on network error - allow retry
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem('mamacare-token');
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, authProvider: 'email' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('mamacare-token', data.token);
        localStorage.setItem('mamacare-user', JSON.stringify(data.user));
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(data.error || 'Invalid email or password');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please ensure the backend server is running.');
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    // For demo purposes, show a message about Google OAuth setup
    toast.info('Google OAuth requires configuration. Please use email login for demo.', {
      description: 'To enable Google Sign-in, you need to set up OAuth credentials in Google Cloud Console.',
      duration: 5000,
    });
    return false;
  }, []);

  const loginWithPhone = useCallback(async (phone: string, otp?: string): Promise<boolean> => {
    setIsLoading(true);
    
    if (!otp) {
      // First step: Request OTP (simulated)
      toast.success(`OTP sent to ${phone} (Demo: Use any 6-digit code)`);
      setIsLoading(false);
      return true;
    } else {
      // Second step: Verify OTP and login
      try {
        const email = `${phone.replace(/\+/g, '')}@phone.mamacare.app`;
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, authProvider: 'phone' }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('mamacare-token', data.token);
          localStorage.setItem('mamacare-user', JSON.stringify(data.user));
          toast.success('Phone login successful!');
          return true;
        } else {
          // User doesn't exist, register them
          const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name: `User ${phone.slice(-4)}`,
              phone,
              authProvider: 'phone',
            }),
          });
          
          const registerData = await registerResponse.json();
          
          if (registerResponse.ok) {
            setUser(registerData.user);
            localStorage.setItem('mamacare-token', registerData.token);
            localStorage.setItem('mamacare-user', JSON.stringify(registerData.user));
            toast.success('Phone login successful!');
            return true;
          }
        }
        return false;
      } catch (error) {
        toast.error('Network error. Please try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, authProvider: 'email' }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('mamacare-token', data.token);
        localStorage.setItem('mamacare-user', JSON.stringify(data.user));
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error(data.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please ensure the backend server is running.');
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mamacare-token');
    localStorage.removeItem('mamacare-user');
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (profile: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('mamacare-token');
      if (!token || !user) return false;
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('mamacare-user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error('Failed to update profile');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const assignRole = useCallback(async (userId: string, role: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('mamacare-token');
      if (!token) return false;
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role }),
      });
      
      if (response.ok) {
        toast.success(`Role updated to ${role}`);
        return true;
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
        return false;
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
      isSuperadmin: user?.role === 'superadmin',
      isLoading,
      login,
      loginWithGoogle,
      loginWithPhone,
      register,
      logout,
      updateProfile,
      assignRole,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
