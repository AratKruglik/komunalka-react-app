import { AuthActionType } from '../actionTypes'
import { authService } from '@shared/api'
import type { AuthDispatch, ScheduleTokenRefreshFn, RefreshTokenManuallyFn } from './types'

/**
 * Initialize auth state from storage on mount
 * Checks for existing tokens and validates them
 *
 * @param dispatch - Auth reducer dispatch function
 * @param scheduleTokenRefresh - Function to schedule token refresh
 * @param refreshTokenManually - Function to manually refresh token if expired
 */
export async function initializeAuth(
  dispatch: AuthDispatch,
  scheduleTokenRefresh: ScheduleTokenRefreshFn,
  refreshTokenManually: RefreshTokenManuallyFn
): Promise<void> {
  const token = authService.getToken()
  const refreshToken = authService.getRefreshToken()
  const expiresAt = authService.getExpiresAt()

  if (token && refreshToken && expiresAt) {
    const expirationTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()

    // Check if token is still valid
    if (expirationTime > currentTime) {
      // Token is valid, restore session
      dispatch({
        type: AuthActionType.SET_TOKENS,
        payload: { token, refreshToken, expiresAt },
      })

      // Schedule refresh
      scheduleTokenRefresh(expiresAt)
    } else {
      // Token expired, try to refresh
      await refreshTokenManually()
    }
  } else {
    // No valid session
    dispatch({ type: AuthActionType.LOGOUT })
  }
}
