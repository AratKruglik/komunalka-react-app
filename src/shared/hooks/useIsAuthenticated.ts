import { useAuth } from './useAuth'

/**
 * Utility hook to check if user is authenticated
 * Convenience hook that extracts only the authentication status
 *
 * @returns Boolean indicating if user is authenticated
 *
 * @example
 * ```tsx
 * function ProtectedContent() {
 *   const isAuthenticated = useIsAuthenticated();
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   return <PrivateContent />;
 * }
 * ```
 */
export function useIsAuthenticated() {
  const { state } = useAuth()
  return state.isAuthenticated
}
