import { AuthActionType } from '../actionTypes';
import { authService } from '../../../api';
import type { AuthDispatch, IsRefreshingRef, ScheduleTokenRefreshFn, LogoutFn } from './types';

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
  // Prevent concurrent refresh requests
  if (isRefreshingRef.current) {
    return;
  }

  const refreshTokenValue = currentRefreshToken || authService.getRefreshToken();

  if (!refreshTokenValue) {
    logout();
    return;
  }

  try {
    isRefreshingRef.current = true;
    dispatch({ type: AuthActionType.REFRESH_START });

    const response = await authService.refreshToken(refreshTokenValue);

    dispatch({
      type: AuthActionType.REFRESH_SUCCESS,
      payload: {
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiration,
        user: response.user,
      },
    });

    // Schedule next refresh
    scheduleTokenRefresh(response.expiration);
  } catch {
    dispatch({ type: AuthActionType.REFRESH_ERROR });
    authService.logout();
  } finally {
    isRefreshingRef.current = false;
  }
}
