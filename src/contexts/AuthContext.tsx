import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the User type
interface User {
  name?: string;
  email?: string;
  prefs?: {
    profileImage?: string;
  };
}

// Define the AuthContext shape
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

// Provider component that wraps your app and makes auth object available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        name: 'Test User',
        email: email,
        prefs: {
          profileImage: '',
        },
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Value provided to consumers of this context
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);