import { AuthActionType } from '../actionTypes'
import { authService, userService } from '@shared/api'
import type { AuthDispatch, IsRefreshingRef, ScheduleTokenRefreshFn, LogoutFn } from './types'
import type { User } from '@shared/types/auth/user.types'

/**
 * Refresh the authentication token
 * Prevents concurrent refresh requests using a ref flag
 *
 * @param isRefreshingRef - Ref to track if refresh is in progress
 * @param currentRefreshToken - Current refresh token from state
 * @param dispatch - Auth reducer dispatch function
 * @param scheduleTokenRefresh - Function to schedule next refresh
 * @param logout - Function to call if refresh fails
 */
export async function refreshToken(
  isRefreshingRef: IsRefreshingRef,
  currentRefreshToken: string | null,
  dispatch: AuthDispatch,
  scheduleTokenRefresh: ScheduleTokenRefreshFn,
  logout: LogoutFn
): Promise<void> {
  if (isRefreshingRef.current) {
    return
  }

  const refreshTokenValue = currentRefreshToken || authService.getRefreshToken()

  if (!refreshTokenValue) {
    logout()
    return
  }

  try {
    isRefreshingRef.current = true
    dispatch({ type: AuthActionType.REFRESH_START })

    const response = await authService.refreshToken(refreshTokenValue)

    let user: User
    try {
      user = await userService.getProfile()
    } catch {
      user = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        role: response.role,
        authProvider: response.authProvider,
        emailVerified: response.emailVerified,
        lastLoginAt: null,
        avatarOptimizedUrl: null,
        avatarThumbnailUrl: null,
        addresses: [],
        createdAt: '',
        updatedAt: '',
      }
    }

    dispatch({
      type: AuthActionType.REFRESH_SUCCESS,
      payload: {
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiration,
        user,
      },
    })

    scheduleTokenRefresh(response.expiration)
  } catch {
    dispatch({ type: AuthActionType.REFRESH_ERROR })
    authService.logout()
  } finally {
    isRefreshingRef.current = false
  }
}
