import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks'
import { ROUTES } from '../constants'

/**
 * ProtectedRoute Component
 *
 * Centralizes authentication checks at the routing level
 * Redirects unauthenticated users to the login page
 *
 * Usage in App.tsx:
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/profile" element={<Profile />} />
 * </Route>
 * ```
 */
export function ProtectedRoute() {
  const { state } = useAuth()

  // Show nothing while checking authentication status
  if (state.isLoading) {
    return null
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Render child routes if authenticated
  return <Outlet />
}
