import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks'
import { ROUTES } from '../constants'

/**
 * PublicRoute Component
 *
 * Routes that should only be accessible when NOT authenticated
 * Redirects authenticated users to the dashboard
 *
 * Usage in App.tsx:
 * ```tsx
 * <Route element={<PublicRoute />}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 * </Route>
 * ```
 */
export function PublicRoute() {
  const { state } = useAuth()

  // Show nothing while checking authentication status
  if (state.isLoading) {
    return null
  }

  // Redirect to dashboard if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  // Render child routes if not authenticated
  return <Outlet />
}
