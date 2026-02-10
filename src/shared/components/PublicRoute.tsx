import { Navigate, Outlet } from 'react-router'
import { authService } from '../api'
import { useAuth } from '../hooks'
import { ROUTES } from '../constants'

export function PublicRoute() {
  const { state } = useAuth()

  if (state.isLoading && authService.isAuthenticated()) {
    return null
  }

  if (state.isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
