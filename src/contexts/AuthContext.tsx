'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { 
  AuthContextType, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData, 
  User 
} from '@/types/context/auth'

/**
 * Authentication Context
 * 
 * Provides global authentication state and methods to all components.
 * Must be wrapped with AuthProvider at the app root.
 */
const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides auth methods to child components.
 * Automatically checks for existing session on mount.
 * 
 * @param children - Child components that will have access to auth context
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  /**
   * Verify current authentication session
   * Called on app initialization to restore user session if valid token exists
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include', // without, the backend won't receive cookies
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Failed to check auth:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  /**
   * Authenticate user with email and password
   * 
   * @param credentials - User email and password
   * @throws Error if login fails
   */
  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error 
    }
  }

  /**
   * Register a new user account
   * 
   * @param data - User registration data
   * @throws Error if registration fails
   */
  const register = async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  /**
   * Log out current user and clear authentication state
   */
  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      console.error('Logout failed:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  /**
   * Update current user's profile information
   * 
   * @param data - Partial user data to update
   * @throws Error if update fails
   */
  const updateProfile = async (data: UpdateProfileData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Profile update failed')
      }

      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access authentication context
 * 
 * Must be used within AuthProvider, otherwise throws an error.
 * 
 * @returns Authentication state and methods
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth()
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login(...)}>Login</button>
 *   }
 *   
 *   return <div>Welcome {user.firstName}</div>
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}