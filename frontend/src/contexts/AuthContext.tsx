"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
// Import service functions
import { fetchUserProfile, loginUser } from '@/services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other user properties as needed based on your backend response
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (token) {
          // Use the service function to fetch user profile
          const profileResponse = await fetchUserProfile();
          if (profileResponse.success) {
            setUser(profileResponse.data);
          } else {
             // If fetching profile fails, clear the token and user
            Cookies.remove('auth_token');
            setUser(null);
            console.error('Auth check failed:', profileResponse.message);
          }
        } else {
             setUser(null); // Ensure user is null if no token exists
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Ensure user is null if auth check fails
        Cookies.remove('auth_token'); // Clear token on unexpected error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Use the service function to login
      const loginResponse = await loginUser(email, password);

      if (!loginResponse.success) {
        throw new Error(loginResponse.message || 'Login failed');
      }

      // Assuming the backend returns { success: true, data: { token, user } }
      const { token, user: userData } = loginResponse.data;

      // Set auth token in cookies (you might want to set expiration)
      Cookies.set('auth_token', token, { expires: 7 }); // Example: expires in 7 days

      // Set user data in state
      setUser(userData);

    } catch (error) {
      console.error('Login failed:', error);
      setUser(null); // Ensure user is null on login failure
      throw error; // Re-throw the error for the component to handle
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    // TODO: Optionally call backend logout API if needed
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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