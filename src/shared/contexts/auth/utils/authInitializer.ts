import { AuthActionType } from '../actionTypes'
import { authService, userService } from '@shared/api'
import type { AuthDispatch, ScheduleTokenRefreshFn, RefreshTokenManuallyFn } from './types'

/**
 * Initialize auth state from storage on mount
 * Checks for existing tokens, validates them, and loads user profile
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

    if (expirationTime > currentTime) {
      dispatch({
        type: AuthActionType.SET_TOKENS,
        payload: { token, refreshToken, expiresAt },
      })

      scheduleTokenRefresh(expiresAt)

      try {
        const user = await userService.getProfile()
        dispatch({ type: AuthActionType.UPDATE_USER, payload: user })
      } catch {
        // Profile loading failed - user stays authenticated but without profile data
      }
    } else {
      await refreshTokenManually()
    }
  } else {
    dispatch({ type: AuthActionType.LOGOUT })
  }
}
