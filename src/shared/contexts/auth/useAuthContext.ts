import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

/**
 * Custom hook to access authentication context
 * @throws {Error} if used outside of AuthProvider
 * @returns Authentication context value with state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, login, logout } = useAuthContext();
 *
 *   if (state.isLoading) return <Spinner />;
 *   if (!state.isAuthenticated) return <Login />;
 *
 *   return <div>Welcome, {state.user?.username}!</div>;
 * }
 * ```
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
