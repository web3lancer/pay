import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AppwriteUser } from '@/lib/auth';
import { DatabaseService, UserProfile } from '@/lib/database';

// Enhanced User type combining Appwrite user and database profile
interface User extends AppwriteUser {
  profile?: UserProfile;
}

// Enhanced AuthContext shape
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  mfaRequired: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (userId: string, secret: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, password: string) => Promise<void>;
  // 2FA methods
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  verifyTwoFactor: (otp: string) => Promise<void>;
  createRecoveryCodes: () => Promise<string[]>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: false,
  isAuthenticated: false,
  isEmailVerified: false,
  mfaRequired: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  verifyEmail: async () => {},
  sendEmailVerification: async () => {},
  sendPasswordReset: async () => {},
  resetPassword: async () => {},
  enableTwoFactor: async () => {},
  disableTwoFactor: async () => {},
  verifyTwoFactor: async () => {},
  createRecoveryCodes: async () => [],
  updateProfile: async () => {},
  refreshUser: async () => {},
});

// Provider component that wraps your app and makes auth object available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Fetch user profile from database
        const profile = await DatabaseService.getUser(currentUser.$id);
        setUserProfile(profile);
        
        // Log successful authentication
        await authService.logSecurityEvent(currentUser.$id, 'session_check', {
          success: true
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signUp(email, password, name);
      
      // Create user profile in database
      if (response) {
        const profileData = {
          userId: response.$id,
          email: response.email,
          username: email.split('@')[0],
          displayName: name,
          kycStatus: 'pending' as const,
          kycLevel: 0,
          twoFactorEnabled: false,
          isActive: true,
          preferredCurrency: 'USD',
        };
        
        await DatabaseService.createUser(profileData);
        
        // Log successful registration
        await authService.logSecurityEvent(response.$id, 'user_registration', {
          email,
          method: 'email_password'
        });
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await authService.signIn(email, password);
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile
        const profile = await DatabaseService.getUser(currentUser.$id);
        setUserProfile(profile);
        
        // Check if 2FA is required
        if (profile.twoFactorEnabled) {
          setMfaRequired(true);
        }
        
        // Log successful login
        await authService.logSecurityEvent(currentUser.$id, 'user_login', {
          email,
          method: 'email_password',
          mfaRequired: profile.twoFactorEnabled
        });
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      
      // Log failed login attempt
      await authService.logSecurityEvent('unknown', 'login_failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (user) {
        await authService.logSecurityEvent(user.$id, 'user_logout', {});
      }
      
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setMfaRequired(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification
  const verifyEmail = async (userId: string, secret: string) => {
    try {
      await authService.verifyEmail(userId, secret);
      
      // Log email verification
      await authService.logSecurityEvent(userId, 'email_verified', {});
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const sendEmailVerification = async () => {
    try {
      await authService.sendEmailVerification();
    } catch (error) {
      console.error('Send email verification failed:', error);
      throw error;
    }
  };

  // Password reset
  const sendPasswordReset = async (email: string) => {
    try {
      await authService.sendPasswordRecovery(email);
    } catch (error) {
      console.error('Send password reset failed:', error);
      throw error;
    }
  };

  const resetPassword = async (userId: string, secret: string, password: string) => {
    try {
      await authService.resetPassword(userId, secret, password);
      
      // Log password reset
      await authService.logSecurityEvent(userId, 'password_reset', {});
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  // 2FA methods
  const enableTwoFactor = async () => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      // Enable MFA in Appwrite
      await authService.enableMFA();
      
      // Update user profile in database
      await DatabaseService.updateUser(user.$id, { twoFactorEnabled: true });
      
      // Update local state
      setUserProfile({ ...userProfile, twoFactorEnabled: true });
      
      // Log 2FA enablement
      await authService.logSecurityEvent(user.$id, '2fa_enabled', {});
    } catch (error) {
      console.error('Enable 2FA failed:', error);
      throw error;
    }
  };

  const disableTwoFactor = async () => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      // Disable MFA in Appwrite
      await authService.disableMFA();
      
      // Update user profile in database
      await DatabaseService.updateUser(user.$id, { twoFactorEnabled: false });
      
      // Update local state
      setUserProfile({ ...userProfile, twoFactorEnabled: false });
      setMfaRequired(false);
      
      // Log 2FA disablement
      await authService.logSecurityEvent(user.$id, '2fa_disabled', {});
    } catch (error) {
      console.error('Disable 2FA failed:', error);
      throw error;
    }
  };

  const verifyTwoFactor = async (otp: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create MFA challenge
      const challenge = await authService.createMFAChallenge('totp');
      
      // Complete challenge with OTP
      await authService.completeMFAChallenge(challenge.$id, otp);
      
      setMfaRequired(false);
      
      // Log successful 2FA verification
      await authService.logSecurityEvent(user.$id, '2fa_verified', {});
    } catch (error) {
      console.error('2FA verification failed:', error);
      
      // Log failed 2FA attempt
      await authService.logSecurityEvent(user.$id, '2fa_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };

  const createRecoveryCodes = async (): Promise<string[]> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await authService.createMFARecoveryCodes();
      
      // Log recovery codes generation
      await authService.logSecurityEvent(user.$id, 'recovery_codes_generated', {});
      
      return response.recoveryCodes || [];
    } catch (error) {
      console.error('Create recovery codes failed:', error);
      throw error;
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    
    try {
      // Update in database
      await DatabaseService.updateUser(user.$id, updates);
      
      // Update local state
      setUserProfile({ ...userProfile, ...updates });
      
      // Log profile update
      await authService.logSecurityEvent(user.$id, 'profile_updated', {
        fields: Object.keys(updates)
      });
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const [currentUser, profile] = await Promise.all([
        authService.getCurrentUser(),
        DatabaseService.getUser(user.$id)
      ]);
      
      if (currentUser) setUser(currentUser);
      setUserProfile(profile);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  // Value provided to consumers of this context
  const value = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerification || false,
    mfaRequired,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    sendEmailVerification,
    sendPasswordReset,
    resetPassword,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    createRecoveryCodes,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);