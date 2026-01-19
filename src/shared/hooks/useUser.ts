import { useAuth } from './useAuth'

/**
 * Utility hook to get just the current user
 * Convenience hook that extracts only the user from auth state
 *
 * @returns Current user object or null if not authenticated
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useUser();
 *
 *   if (!user) return <Login />;
 *
 *   return (
 *     <div>
 *       <h1>{user.username}</h1>
 *       <p>{user.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser() {
  const { state } = useAuth()
  return state.user
}
