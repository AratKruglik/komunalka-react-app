import type { RefreshTokenManuallyFn, LogoutFn, ScheduleTokenRefreshFn } from './types'

/**
 * Handle visibility change (tab sleep/wake)
 * Check token validity when tab becomes visible
 *
 * @param isAuthenticated - Current authentication status
 * @param expiresAt - Token expiration time (ISO string)
 * @param refreshTokenManually - Function to refresh token
 * @param logout - Function to logout user
 * @param scheduleTokenRefresh - Function to reschedule token refresh
 */
export function handleVisibilityChange(
  isAuthenticated: boolean,
  expiresAt: string | null,
  refreshTokenManually: RefreshTokenManuallyFn,
  logout: LogoutFn,
  scheduleTokenRefresh: ScheduleTokenRefreshFn
): void {
  if (document.visibilityState === 'visible' && isAuthenticated && expiresAt) {
    const expirationTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const timeUntilExpiry = expirationTime - currentTime

    // If token expires in less than 5 minutes, refresh immediately
    if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
      refreshTokenManually()
    } else if (timeUntilExpiry <= 0) {
      logout()
    } else {
      // Reschedule refresh based on current time
      scheduleTokenRefresh(expiresAt)
    }
  }
}
