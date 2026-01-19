/**
 * Authentication context module barrel export
 * Provides clean import interface for auth context functionality
 */

// Main exports
export { AuthProvider, AuthContext } from './AuthProvider'
export { useAuthContext } from './useAuthContext'

// Type re-exports for convenience
export type { User, AuthState, AuthAction, AuthContextValue } from './types'

// Alias for backward compatibility (optional)
export { useAuthContext as useAuth } from './useAuthContext'
