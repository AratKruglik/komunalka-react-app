import { useAuthContext } from '../contexts/auth'

/**
 * Custom hook to access authentication context
 * @throws {Error} if used outside of AuthProvider
 * @returns Authentication context value with state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, login, logout } = useAuth();
 *
 *   if (state.isLoading) return <Spinner />;
 *   if (!state.isAuthenticated) return <Login />;
 *
 *   return <div>Welcome, {state.user?.username}!</div>;
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext()
}
