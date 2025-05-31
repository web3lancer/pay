import { createContext, useContext } from 'react'

// interface AuthContextType {
//   user: Models.User<Models.Preferences> | null
//   userProfile: UserProfile | null
//   isLoading: boolean
//   login: (email: string, password: string) => Promise<void>
//   register: (email: string, password: string, name: string) => Promise<void>
//   logout: () => Promise<void>
//   refreshProfile: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)
// import AuthProvider from './AuthContextClient'

import { AuthProvider } from './AuthContextClient'
import { UserProfile } from '@/lib/auth'
import { Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  userProfile: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider }