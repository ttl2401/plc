"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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

  // Helper function to fetch user profile
  const fetchUserProfile = async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // If fetching profile fails (e.g., invalid token), clear the token
      Cookies.remove('auth_token');
      throw new Error(data.message || 'Failed to fetch user profile');
    }

    return data.data as User; // Assuming user data is in data.data
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('auth_token');
        if (token) {
          // Fetch user profile using the token
          const fetchedUser = await fetchUserProfile(token);
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Ensure user is null if auth check fails
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Assuming the backend returns { success: true, data: { token, user } }
      const { token, user: userData } = data.data;

      // Set auth token in cookies (you might want to set expiration)
      Cookies.set('auth_token', token, { expires: 7 }); // Example: expires in 7 days

      // Set user data in state
      setUser(userData);
      
      // Return something if needed, or just resolve the promise
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